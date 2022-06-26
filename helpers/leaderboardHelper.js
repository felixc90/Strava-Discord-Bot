const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const User = require('../models/User')
const Guild = require('../models/Guild')
const { getWeeklyData } = require('./otherHelper.js')

module.exports = {
    getLeaderboardEmbed : getLeaderboardEmbed,
    getMessageRow : getMessageRow
}

async function getLeaderboardEmbed(guild) {
    let leaderboard = await getLeaderboard(guild)
    const leaderboardEmbed = new MessageEmbed()
    .setColor('#05CBE1')
    .setTitle(`Weekly Strava Leaderboard`)
    .setDescription(guild.use_time ? '=======based on time========' : '======based on distance======')
    .setThumbnail('https://i.imgur.com/xJXLhW3.png')
    .addFields(leaderboard)
    .setTimestamp()
    .setFooter(`\u200b\n Page ${guild.page_num}`);

    return leaderboardEmbed
}

function getMessageRow(guild) {
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

async function getLeaderboard(guild) {
    medals = ['\u200b\n🥇','🥈','🥉', '4th', '5th','6th','7th','8th','9th','10th']

    const weekly_data = await getWeeklyData(guild)
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