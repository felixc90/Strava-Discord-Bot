const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const User = require('../models/User')
const { getTimeGraph } = require('../utils/graph')
const { getRunData, getStartOfPeriod, getNumActivePeriod } = require('../utils/helper')

module.exports = { 
    getLeaderboardEmbed : getLeaderboardEmbed,
    getMessageRow : getMessageRow
}

async function getLeaderboardEmbed(guild, metricStrategy) {
    return new MessageEmbed()
    .setColor('#05CBE1')
    .setTitle(`Weekly Leaderboard`)
    .setDescription(metricStrategy.getHeader())
    .setThumbnail('https://i.imgur.com/xJXLhW3.png')
    .addFields(await getLeaderboard(guild, metricStrategy))
    .setTimestamp()
    .setFooter(`\u200b\n Page ${guild.pageNumber}`);
}

function getMessageRow(guild, metricStrategy) {
        const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('toggle-key')
                .setLabel(metricStrategy.getLabel())
                .setStyle('DANGER')
        );
        if (guild.pageNumber > 1) {
            row.addComponents(
                new MessageButton()
                .setCustomId('prev-page')
                .setLabel('Prev Page')
                .setStyle('SECONDARY'),
            )
        }
        if (guild.pageNumber < Math.ceil(guild.members.length / 10)) {
            row.addComponents(
                new MessageButton()
                .setCustomId('next-page')
                .setLabel('Next Page')
                .setStyle('SECONDARY'),
            )
        }
        return row
    }


async function getLeaderboard(guild, metricStrategy) {
    medals = ['\u200b\n🥇','🥈','🥉', '4th', '5th','6th','7th','8th','9th','10th']
    
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