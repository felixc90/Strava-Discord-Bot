const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const User = require('../models/User')
const { getTimeGraph } = require('../util/graph')
const { getRunData, getStartOfPeriod, getNumActivePeriod } = require('../util/helper')

module.exports = {
    getLeaderboardEmbed : async function getLeaderboardEmbed(guild) {
        return new MessageEmbed()
        .setColor('#05CBE1')
        .setTitle(`Weekly Strava Leaderboard`)
        .setDescription(guild.use_time ? '=======based on time========' : '======based on distance======')
        .setThumbnail('https://i.imgur.com/xJXLhW3.png')
        .addFields(await getLeaderboard(guild))
        .setTimestamp()
        .setFooter(`\u200b\n Page ${guild.page_num}`);
    },
    
    getMessageRow : function getMessageRow(guild) {
        const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('update')
                .setLabel('Update')
                .setStyle('PRIMARY'),
            new MessageButton()
                .setCustomId('toggle-key')
                .setLabel(`Use ${!guild.use_time ? 'Time' : 'Distance'}`)
                .setStyle('DANGER'),
            new MessageButton()
                .setCustomId('change-page')
                .setLabel(`${guild.page_num == 1 ? 'Next Page' : 'Prev Page'}`)
                .setStyle('SECONDARY'),
        );
        return row
    }
}


async function getLeaderboard(guild) {
    medals = ['\u200b\n🥇','🥈','🥉', '4th', '5th','6th','7th','8th','9th','10th']

    // Require the weekly data for each user
    const unit_of_time = "week"
    const weekly_data = []

    let difference_time = (new Date()).getTime() - getStartOfPeriod(new Date(), unit_of_time).getTime();
    let difference_days = parseInt(difference_time / (1000 * 3600 * 24));
    for (const member_id of guild.members) {
        const user = await User.findOne({discord_id: member_id})
        const run_data = await getRunData(member_id, unit_of_time, difference_days)
        console.log(run_data)
        weekly_data.push({
            username: user.username,
            name: user.name,
            weekly_distance: run_data.distances.reduce((accumulator, curr) => accumulator + curr),
            weekly_time: run_data.times.reduce((accumulator, curr) => accumulator + curr),
        })
    }

    // Sort data
    weekly_data.sort((data1, data2) =>  useTime ? 
        data2.weekly_time - data1.weekly_time:
        data2.weekly_distance - data1.weekly_distance
    )
    if (weekly_data.length == 0) return {name: '👻', value: 'No records to show...', inline: false}
    const start = guild.page_num == 1 ? 0 : 5
    const end = guild.page_num == 1 ? 5 : 10
    return (weekly_data.slice(start, end).map(user => ({
        name: `${medals[weekly_data.indexOf(user)]}`,
        value: `${
            guild.use_time ? 
                parseInt(user.weekly_time) + 'min' :
                Math.round(parseInt(user.weekly_distance) * 100) / 100.0 + 'km'} | ${
            user.name + (user.username === null ? '' : ` (${user.username})`)
        }`,
        inline: false,
    })))
}