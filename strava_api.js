const fetch = require('node-fetch');
const dotenv = require('dotenv');
const User  = require('./models/User');
const Guild  = require('./models/Guild');

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
                    'statistics' : [{
                        'week_starting' : getMonday(new Date()),
                        'total_distance' : 0,
                        'total_time' : 0,
                        'statistics_by_day' : Array(7).fill({
                            'total_distance' : 0, 
                            'total_time' : 0})
                    }],
                    'routes' : [],
                    'most_recent_run' : -1
            })
            const findGuild = await Guild.find({guild_id : discord_data.guild_id})
            let guild = findGuild[0]
            guild.members.push(user.discord_id)
            await guild.save()
            await user.save()
            console.log('Done!')
            }
        )
}

async function reAuthorize(user) {
    await fetch(auth_link, {
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
            await updateWeeks(user)
            let week = getMonday(new Date())
            let week_counter = 0
            for (let run = 0; run < data.length; run++) {
                // console.log(data[run].id, data[run].distance)
                if (user.most_recent_run == data[run].id) break
                if (user.most_recent_run == -1 && 
                    (getMonday(data[run].start_date) - week != 0)) break
                if (data[run].type != "Run") continue
                while (getMonday(data[run].start_date) - week != 0) {
                    let prev_week = new Date(week)
                    prev_week.setDate(prev_week.getDate() - 7)
                    week = prev_week
                    week_counter++
                }
                const distance = data[run].distance / 1000
                const moving_time = data[run].moving_time / 60
                const tmp_date = new Date(data[run].start_date)
                const day = (tmp_date.getDay() + 6) % 7
                user.statistics[week_counter].total_distance += distance
                user.statistics[week_counter].total_time += moving_time
                user.statistics[week_counter].statistics_by_day[day].total_distance += distance
                user.statistics[week_counter].statistics_by_day[day].total_time += moving_time
                if (data[run].map.summary_polyline != null) {
                    user.routes.push(data[run].map.summary_polyline)
                }
            }
            if (data.length != 0) user.most_recent_run = data[0].id
            await user.save() 
        })
}

async function addGuild(guild_id) {
    console.log(guild_id)
    let users = await User.find({ guilds: guild_id } , 'discord_id')
    users = users.map(user => user.discord_id)
    console.log(users)
    const guild = new Guild({
        'guild_id' : guild_id,
        'members' : users,
        'use_time' : true,
        'page_num' : 1
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


async function updateWeeks(user) {
    const curr_week = getMonday(new Date())
    let week = user.statistics[0].week_starting;
    while (curr_week - week != 0) {
        let next_week = new Date(week)
        next_week.setDate(next_week.getDate() + 7)
        week = next_week
        let week_data = {
            'week_starting' : week,
            'total_distance' : 0,
            'total_time' : 0,
            'statistics_by_day' : Array(7).fill({
                'total_distance' : 0, 
                'total_time' : 0})
        }
        await user.statistics.unshift(week_data)
    }
    await user.save()
}

function getMonday(d) {
    d = new Date(d);
    d.setUTCHours(0,0,0,0)
    var day = d.getDay(),
        diff = d.getDate() - day + (day == 0 ? -6:1); // adjust when day is sunday
    return new Date(d.setDate(diff));
  }