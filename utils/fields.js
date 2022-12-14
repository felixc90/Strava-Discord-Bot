const User  = require('../models/User');
const Guild  = require('../models/Guild');
const { getStartOfPeriod } = require('../utils/helper')

module.exports = { 
    getFields : getFields
}

async function getFields(type, userId, guildId) {
    const user = await User.findOne({discordId: userId});
    const guild = await Guild.findOne({guildId: guildId});
    switch (type) {
        case "log":
            return guild.members.find(member => member.id == user.discordId).logEntries.map(
                logEntry => ({
                    'name' : `${logEntry.logType} on ${logEntry.dateStart.toDateString()}`,
                    'value' : `+ ${logEntry.value}`,
                    'inline' : false
                })
            )
        case "leaderboard":
            variable = await getLeaderboardFields(guild)
            console.log(variable)
            return await getLeaderboardFields(guild);
        default:
            break;
    }
}

async function getLeaderboardFields(guild) {
    
    // Require the weekly data for each user
    const weeklyData = []
    
    // Calculate the number of days since the start of the week
    let differenceTime = (new Date()).getTime() - getStartOfPeriod(new Date(), "day").getTime();
    let differenceDays = parseInt(differenceTime / (1000 * 3600 * 24));
    for (const member of guild.members) {
        // Get data for user since the start of the week
        const user = await User.findOne({ discordId : member.id}, 'username name')
        let total = 0
        for (const logEntry of member.logEntries) {
            if (logEntry.dateStart - getStartOfPeriod(new Date(), "week") < 0) {
                break
            }
            total += logEntry.value
        }
        weeklyData.push({
            username: user.username,
            name: user.name,
            data: total,
        })
    }
    
    // Sort data by value
    weeklyData.sort((user1, user2) =>  user1.data - user2.data)
    if (weeklyData.length == 0) return {name: '👻', value: 'No records to show...', inline: false}
    
    return (weeklyData.map(user => ({
        name: `${ordinal(weeklyData.indexOf(user) + 1)}`,
        value: `${user.data} | ${
            user.name + (user.username === null ? '' : ` (${user.username})`)}`,
        inline: false,
    })))
}


function ordinal(n) {
    if (n <= 3) {
        medals = ['\u200b\n🥇','🥈','🥉']
        return medals[n - 1]
    }
    var s = ["th", "st", "nd", "rd"];
    var v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}