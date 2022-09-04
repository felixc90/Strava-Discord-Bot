const fetch = require('node-fetch');
const dotenv = require('dotenv');
const Run  = require('../models/Run');
const User  = require('../models/User');
const Guild  = require('../models/Guild');

dotenv.config()

const auth_link = "https://www.strava.com/oauth/token"

module.exports = {
    updateUsers : updateUsers,
    reAuthorize : reAuthorize
}

// Returns an access token for the given refresh token
async function reAuthorize(refresh_token) {
    return await fetch(auth_link, {
        method: 'post',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            client_id: '71610',
            client_secret: process.env.STRAVA_CLIENT_SECRET,
            refresh_token: refresh_token,
            grant_type: 'refresh_token'
        })

    }).then(res => res.json())
    .then(json => json.access_token)
}


async function updateUsers(guildId) {
    const guild = await Guild.findOne({guildId: guildId})
    const users = await User.find({discordId : { $in: guild.members } })
    for (const user of users) {
        const accessToken = await reAuthorize(user.refresh_token);
        await getActivities(accessToken, user)
    }
}

async function getActivities(access_token, user) {
    const activities_link = `https://www.strava.com/api/v3/athlete/activities?access_token=${access_token}`
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
                    break
                }
                const new_run = new Run({
                    'id' : activity.id,
                    'name' : activity.name,
                    'start_latlng' : activity.start_latlng,
                    'end_latlng' : activity.end_latlng,
                    'date' : activity.start_date_local,
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