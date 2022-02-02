const fetch = require('node-fetch');
const dotenv = require('dotenv');
const User  = require('./models/User');
const Guild  = require('./models/Guild');
const Routes  = require('./models/Route');

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
                'sex' : data.athlete.sex,
                'region' : data.athlete.city + data.athlete.state + data.athlete.country,
                'created_at' : data.athlete.created_at,
                'joined_at' : new Date(),
                'days_last_active' : -1,
                'most_recent_run' : {
                    'time' : 0,
                    'id': -1
                },
                'longest_run' : {
                    'date' : 0,
                    'time' : -1,
                    'distance' : -1,
                    'name' : '',
                    'start_latlng' : [],
                    'end_latlng' : [],
                },
                'statistics' : [{
                    'week_starting' : getMonday(new Date()),
                    'total_distance' : 0,
                    'total_time' : 0,
                    'statistics_by_day' : Array(7).fill({
                        'total_distance' : 0, 
                        'total_time' : 0}),
                }],
                'number_of_runs' : 0,
                'total_distance' : 0,
                'total_time' : 0
            })
            let guild = await Guild.findOne({guild_id : discord_data.guild_id})
            guild.members.push(user.discord_id)
            await guild.save()
            await user.save()
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
            let curr_week = getMonday(new Date())
            let week_index = 0
            let latest_run = -1
            for (let run = 0; run < data.length; run++) {
                // console.log(data[run].id, data[run].map.summary_polyline)
                // continue
                let run_date = getMonday(data[run].start_date)
                if (user.most_recent_run.id == data[run].id) {
                    console.log('Already added run with this id.')
                    break
                }
                console.log(user.most_recent_run.time, new Date(data[run].start_date))
                if (user.most_recent_run.id != -1 &&
                    new Date(data[run].start_date) - user.most_recent_run.time <= 0) {
                    console.log('Already added run with this time.')
                    break
                } 
                if ((run_date - curr_week < 0) && user.most_recent_run.id == -1) {
                    console.log('New users can only add this week\'s runs.')
                    break
                }
                if (data[run].type != "Run") continue
                if (latest_run == -1) latest_run = run
                console.log(data[run].start_date)
                while (run_date - curr_week != 0) {
                    console.log(run_date, curr_week)
                    let prev_week = new Date(curr_week)
                    prev_week.setDate(prev_week.getDate() - 7)
                    curr_week = prev_week
                    week_index++
                }
                console.log(week_index)
                await updateStatistics(user, data[run], week_index)
            }
            if (latest_run != -1) {
                user.most_recent_run.id = data[latest_run].id
                let new_date = new Date(data[latest_run].start_date)
                user.most_recent_run.time = new_date
            }
            user.days_last_active = updateActiveDays(user)
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

function updateActiveDays(user) {
    let days_last_active = 0 
    let inactive_days = 0
    for (let i = 0; i < user.statistics.length; i++) {
        let week = user.statistics[i]
        for (let num_day = 6; num_day > -1; num_day--) {
            var d = new Date();
            // If day is in the future
            if (i == 0 && num_day > (d.getDay() + 6) % 7) {
                continue
            }
            days_last_active++;
            if (week.statistics_by_day[num_day].total_distance == 0) {
                inactive_days++
            } else {
                inactive_days = 0
            }
            if (inactive_days == 7) {
                return days_last_active - 7
            }
        }
    }
    return days_last_active - inactive_days
}

async function updateStatistics(user, run, week_index) {
    const distance = run.distance / 1000
    const moving_time = run.moving_time / 60
    const start_date = new Date(run.start_date)
    const day = (start_date.getDay() + 6) % 7
    const statistics_week = {
        total_distance : user.statistics[week_index].total_distance + distance,
        total_time : user.statistics[week_index].total_time + moving_time,
        week_starting : user.statistics[week_index].week_starting,
        statistics_by_day: user.statistics[week_index].statistics_by_day
    }
    statistics_week.statistics_by_day[day].total_distance += distance
    statistics_week.statistics_by_day[day].total_time += moving_time
    user.statistics.set(week_index, statistics_week)
    user.total_distance += distance
    user.total_time += moving_time
    if (distance >= user.longest_run.distance) {
        user.longest_run = {
            date: start_date,
            time: moving_time,
            distance: distance,
            name: run.name,
            start_latlng: Array.from(run.start_latlng),
            end_latlng: Array.from(run.end_latlng),
        }
    }
    await user.save()
}

module.exports = {
    authoriseUser: authoriseUser,
    reAuthorize: reAuthorize,
    addGuild: addGuild
};