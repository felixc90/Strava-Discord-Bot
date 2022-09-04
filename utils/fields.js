const User  = require('../models/User');
const Guild  = require('../models/Guild');

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
            
        default:
            
            break;
    }
}

async function getLeaderboard(guild) {
    
    // Require the weekly data for each user
    const weekly_data = []
    
    // Calculate the number of days since the start of the week
    let difference_time = (new Date()).getTime() - getStartOfPeriod(new Date(), "day").getTime();
    let difference_days = parseInt(difference_time / (1000 * 3600 * 24));
    for (const member_id of guild.members) {
        // Get data for user since the start of the week
        const user = await User.findOne({discord_id: member_id})
        const data = await getRunData(member_id, "day", metricStrategy, difference_days)
        weekly_data.push({
            username: user.username,
            name: user.name,
            runData: data.runData.reduce((accumulator, curr) => accumulator + curr),
        })
    }
    
    // Sort data by 
    weekly_data.sort((data1, data2) =>  data1.runData - data2.runData)
    if (weekly_data.length == 0) return {name: '👻', value: 'No records to show...', inline: false}

    const start = (guild.pageNumber - 1) * 5
    const end = guild.pageNumber * 5
    return (weekly_data.slice(start, end).map(user => ({
    name: `${medals[weekly_data.indexOf(user)]}`,
    value: `${metricStrategy.getValue(user.runData)} | ${
        user.name + (user.username === null ? '' : ` (${user.username})`)}`,
        inline: false,
    })))
}


function ordinal(n) {
    if (n <= 3) {
        medals = ['\u200b\n🥇','🥈','🥉']
        return medals[n]
    }
    var s = ["th", "st", "nd", "rd"];
    var v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}