const fetch = require('node-fetch');
const dotenv = require('dotenv');
const Run  = require('../models/Run');
const User  = require('../models/User');
const Guild  = require('../models/Guild');

dotenv.config()

const auth_link = "https://www.strava.com/oauth/token"

exports.add = async (req, res) => {
    const guild_id = req.body.guild_id;
    addGuild(guild_id);
    res.send({message: "New guild added!"});
}

async function addGuild(guild_id) {
    console.log('Adding guild: ' + guild_id)
    const findGuild = await Guild.find({guild_id: parseInt(guild_id)})
    if (findGuild.length != 0) {
        console.log('Guild already exists!')
    }
    // Not fully sure the following line works. It supposedly adds all users
    // who have previously registered into the guild
    let users = await User.find({ guilds: guild_id } , 'discord_id')
    users = users.map(user => user.discord_id)
    const guild = new Guild({
        'guild_id' : guild_id,
        'members' : users,
        'use_time' : true,
        'page_num' : 1,
    })
    await guild.save()
}

exports.update = async (req, res) => {
    console.log('Updating Users...')
    const guild = await Guild.findOne({guild_id: req.body.guild_id})
    const users = await User.find({discord_id : { $in: guild.members } })
    for (const user of users) {
        reAuthorize(user)
    }
    res.send({message: "Users updated!"});
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

async function getActivities(res, user) {
    const activities_link = `https://www.strava.com/api/v3/athlete/activities?access_token=${res.access_token}`
    await fetch(activities_link)
        .then((res) => res.json())
        .then(async (data) => 
        {   
            const new_runs = []
            if (data.length == 0) return
            for (const activity of data) {
                if (activity.type != "Run") continue
                if (user.statistics.runs.length != 0 &&
                    user.statistics.most_recent_run == activity.id) {
                    console.log('Already added run with this id.')
                    break
                }
                const new_run = new Run({
                    'id' : activity.id,
                    'name' : activity.name,
                    'start_latlng' : activity.start_latlng,
                    'end_latlng' : activity.end_latlng,
                    'date' : activity.start_date,
                    'time' : activity.moving_time / 60,
                    'distance' : activity.distance / 1000,
                    'summary_polyline' : activity.map.summary_polyline,
                })
                new_run.save()
                new_runs.push(new_run)
            }
            user.statistics.most_recent_run = data[0].id
            new_runs.reverse()
            for (const new_run of new_runs) {
                user.statistics.runs.unshift(new_run);
            }
            user.save()
        })
}

exports.weeklydata = async (req, res) => {
    console.log('Updating Users...')
    const guild = await Guild.findOne({guild_id: req.params.guild_id})
    res.send({weekly_data: await getWeeklyData(guild)
        useTime : guild.use_time,
    });
}

async function getWeeklyData(guild) {
    const response = []
    for (const member_id of guild.members) {
        let weekly_distance = 0;
        let weekly_time = 0;
        const user = await User.findOne({discord_id: member_id})
        const runs = (await user.statistics.populate({path: 'runs'})).runs
        const today = new Date()
        for (const run of runs) {
            if (run.date < getStartOfWeek(new Date())) {
                break
            }
            weekly_distance += run.distance
            weekly_time += run.time
        }
        response.push({
            username: user.username,
            name: user.name,
            weekly_distance: weekly_distance,
            weekly_time: weekly_time
        })
    }
    response.sort((data1, data2) =>  useTime ? 
        data2.weekly_time - data1.weekly_time:
        data2.weekly_distance - data1.weekly_distance
    )
    return response
}

function getStartOfWeek(d) {
    d = new Date(d);
    d.setUTCHours(0,0,0,0)
    var day = d.getDay(),
        diff = d.getDate() - day + (day == 0 ? -6:1); // adjust when day is sunday
    return new Date(d.setDate(diff));
}