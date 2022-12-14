const fetch = require('node-fetch');
const dotenv = require('dotenv');
const Run  = require('../models/Run');
const User  = require('../models/User');
const Guild  = require('../models/Guild');

dotenv.config()

const authLink = "https://www.strava.com/oauth/token"

module.exports = {
    updateUsers : updateUsers,
    reAuthorize : reAuthorize
}

// updates every user in the guild
async function updateUsers(guildId) {
  const guild = await Guild.findOne({guildId: guildId})
  const users = await User.find({discordId : { $in: guild.members.map(member => member.id) } })
  for (const user of users) {
    const accessToken = await reAuthorize(user.refreshToken);
    const newRuns = []
    await getActivities(newRuns, accessToken, user.lastUpdated, 1);
    console.log(newRuns)
    user.runs = [...newRuns, ...user.runs];
    user.lastUpdated = new Date();
    // await user.save();
    // await updateGuildUser(guild, user);
  }
}

// returns an access token for the given refresh token
async function reAuthorize(refreshToken) {
  return await fetch(authLink, {
    method: 'post',
    headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        client_id: '71610',
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
    })
  })
  .then(res => res.json())
  .then(json => json.access_token)
}


// updates data for a single user
async function getActivities(newRuns, accessToken, lastUpdated, page) {
  console.log(page)
  const activitiesLink = `https://www.strava.com/api/v3/athlete/activities?access_token=${accessToken}&page=${page}&after=${lastUpdated.getTime() / 1000}`
  await fetch(activitiesLink)
  .then(res => res.json())
  .then(async (data) => {
    if (data.length == 0) return
    for (const activity of data) {
      if (activity.type != "Run") continue;
      const newRun = new Run({
        'id' : activity.id,
        'name' : activity.name,
        'startLatlng' : activity.start_latlng,
        'endLatlng' : activity.end_latlng,
        'date' : activity.start_date_local,
        'time' : activity.moving_time / 60,
        'distance' : activity.distance / 1000,
        'summaryPolyline' : activity.map.summary_polyline,
      })
      newRun.save()
      newRuns.unshift(newRun)
    }
    await getActivities(newRuns, accessToken, lastUpdated, page + 1)
  })
}





// async function updateGuildUser(guild, user) {
//     const runs = (await user.populate({path: 'runs'})).runs
//     const guildUser = guild.members.find(member => member.id == user.discordId)
//     const logEntries = []
//     for (const run of runs) {
//         if (run.id == guildUser.mostRecentRunId) break
//         logEntries.push({
//             'logType' : "run",
//             'value' : parseInt(run.time),
//             'dateStart' : run.date,
//             'dateEnd' : new Date()
//         })
//         guildUser.totalExp += run.time;
//     }
//     if (logEntries.length == 0) return
//     guildUser.mostRecentRunId = runs[0].id
//     logEntries.reverse()
//     for (const logEntry of logEntries) {

//         guildUser.logEntries.unshift(logEntry);
//     }
//     await guild.save()
// }