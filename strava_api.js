const fetch = require('node-fetch');
const dotenv = require('dotenv');
const User  = require('./models/User');
const Time  = require('./models/Time');
const Guild  = require('./models/Guild');
const Route  = require('./models/Route');

dotenv.config()

const auth_link = "https://www.strava.com/oauth/token"

function authoriseUser(discord_data, code) {
    fetch(auth_link,{
        method: 'post',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            client_id: '71610',
            client_secret: process.env.STRAVA_CLIENT_SECRET,
            code: code,
            grant_type: 'authorization_code'
        })
    }).then(res => res.json())
        .then(async data => {
            console.log('Adding new user...')
            const user = new User({
                    'strava_id' : data.athlete.id,
                    'discord_id' : discord_data.user_id,
                    'refresh_token' : data.refresh_token,
                    'name' : `${data.athlete.firstname} ${data.athlete.lastname}`,
                    'username' : discord_data.username,
                    'profile' : data.athlete.profile,
                    'guilds' : [discord_data.guild_id],
                    'weekly_stats' : {
                        'total_distance' : 0,
                        'total_time' : 0,
                        'most_recent_recorded_id' : -1,
                    }
            })
            const route = new Route({
                'owner' : data.athlete.id,
                'polylines' : []
            })
            const findGuild = await Guild.find({guild_id : discord_data.guild_id})
            let guild = findGuild[0]
            guild.members.push(user.discord_id)
            await guild.save()
            await user.save()
            await route.save()
            console.log('Done!')
            }
        )
}

async function reAuthorize(user) {
    fetch(auth_link, {
        method: 'post',

        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            client_id: '71610',
            client_secret: process.env.STRAVA_CLIENT_SECRET,
            refresh_token: user.refresh_token,
            grant_type: 'refresh_token'
        })

    }).then(res => res.json())
        .then(res => getActivities(res, user))
}

function getActivities(res, user) {
    const activities_link = `https://www.strava.com/api/v3/athlete/activities?access_token=${res.access_token}`
    fetch(activities_link)
        .then((res) => res.json())
        .then(async (data) => 
        {   
            // computing the date reference for start of week
            const times = await Time.find()
            let time = new Time({
                'week' : -1
            }) 
            if (times.length == 0) {
                await time.save()
            } else {
                time = times[0]
            }

            const date = new Date()
            date.setDate(date.getDate() - date.getDay() + 1)
            const start_of_week = new Date(date.toDateString())
            // If new week, reset all statistics
            if (start_of_week != time.week) {
                user.weekly_stats = {
                    'total_distance' : 0,
                    'total_time' : 0,
                    'most_recent_recorded_id' : -1,
                }
                time.week = start_of_week
                await user.save()
                await time.save()
            }
            console.log(`Computing statistics for week starting ${time.week}`)
            for (let run = 0; run < data.length; run++) {
                const date_of_run = new Date(data[run].start_date_local)
                // Do not update user stats if run is in a previous week or
                // if we have reached a previously updated run
                if (date_of_run < start_of_week || parseInt(data[run].id) ===
                    user.weekly_stats.most_recent_recorded_id) {
                    break;
                }
                if (run === 0) {
                    user.weekly_stats.most_recent_recorded_id = data[run].id
                }
                if (data[run].type != "Run") {
                    continue;
                }
                user.weekly_stats.total_distance += data[run].distance / 1000
                user.weekly_stats.total_time += data[run].moving_time / 60
                const routes = await Route.find({owner: user.strava_id})
                if (!routes[0].polylines.includes(data[run].map.summary_polyline)
                && data[run].map.summary_polyline != null) {
                    const route = routes[0]
                    route.polylines.push(data[run].map.summary_polyline)
                    await route.save()
                }
            }
            console.log(user.name, user.weekly_stats)
            await user.save()
        })
}

async function addGuild(guild_id) {
    console.log(guild_id)
    const guild = new Guild({
        'guild_id' : guild_id,
        'members' : [],
    })
    const findGuild = await Guild.find({guild_id: parseInt(guild_id)})
    if (findGuild.length != 0) return
    await guild.save()
    console.log(guild)
}

module.exports = {
    authoriseUser: authoriseUser,
    reAuthorize: reAuthorize,
    addGuild: addGuild
};