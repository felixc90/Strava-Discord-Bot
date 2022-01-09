const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const User = require('../models/User')
const Guild = require('../models/Guild')


module.exports = {
	data: new SlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('Displays the weekly Strava leaderboard!'),
        // .addSubcommand(subcommand =>
        //     subcommand
        //         .setName('time')
        //         .setDescription('What ran the most minutes?'))
        // .addSubcommand(subcommand =>
        //     subcommand
        //         .setName('distance')
        //         .setDescription('What ran the most kilometres?')),
        async execute(interaction) {
            // console.log(interaction)
        const guild = await Guild.find({guild_id: interaction.guild.id})
        if (guild[0].page_num == 2) {
            guild[0].page_num = 1;
            guild[0].save()
        }
        const leaderboardEmbed = await getEmbed(guild[0].use_time, guild[0].guild_id, 1)
        const leaderboardRow = getRow(guild[0].use_time, 1)
        await interaction.reply({ embeds: [leaderboardEmbed], components: [leaderboardRow]})
        },
        getEmbed: getEmbed,
        getRow: getRow
};

async function getEmbed(useTime, guildId, pageNum) {
    let leaderboard = await getLeaderboard(useTime, guildId, pageNum)
    const leaderboardEmbed = new MessageEmbed()
    // .setColor('#8c00ff')
    .setColor('0x0099ff')
    .setTitle(`Weekly Strava Leaderboard`)
    .setDescription(useTime ? '=======based on time========' : '======based on distance======')
    .setThumbnail('https://i.imgur.com/xJXLhW3.png')
    .addFields(leaderboard)
    .setTimestamp()
    // .setFooter("\u200b\nOnly the disciplined ones are free in life.\n - Eliud Kipchoge");
    .setFooter(`\u200b\n ${pageNum == 1 ? 'Page 1' : 'Page 2'}`);

    return leaderboardEmbed
}

function getRow(useTime, pageNum) {
    const row = new MessageActionRow()
    .addComponents(
        new MessageButton()
            .setCustomId('update')
            .setLabel('Update')
            .setStyle('PRIMARY'),
        new MessageButton()
            .setCustomId('toggle-key')
            .setLabel(`Use ${!useTime ? 'Time' : 'Distance'}`)
            .setStyle('DANGER'),
        new MessageButton()
            .setCustomId('change-page')
            .setLabel(`${pageNum == 1 ? 'Next Page' : 'Prev Page'}`)
            .setStyle('SECONDARY'),
            // .setEmoji('🥲'),
    );
    return row
}
async function getLeaderboard(useTime, guildId, pageNum) {
    medals = ['\u200b\n🥇','🥈','🥉', '4th', '5th','6th','7th','8th','9th','10th']
    const guild = await Guild.find({guild_id: guildId})
    const users = await User.find({discord_id : { $in: guild[0].members } }, 'name username statistics')
    console.log(users)
    if (users.length == 0) return {name: '👻', value: 'No records to show...', inline: false}
    users.sort((user1, user2) =>  useTime ? 
        user2.statistics[0].total_time - user1.statistics[0].total_time:
        user2.statistics[0].total_distance - user1.statistics[0].total_distance
    )
    const start = pageNum == 1 ? 0 : 5
    const end = pageNum == 1 ? 5 : 10
    console.log(start, end)
    console.log(pageNum)
    return (users.slice(start, end).map(user => ({
        name: `${medals[users.indexOf(user)]}`,
        value: `${
            useTime ? 
                parseInt(user.statistics[0].total_time) + 'min' :
                Math.round(parseInt(user.statistics[0].total_distance)*100)/100.0 + 'km'} | ${
            user.name + (user.username === null ? '' : ` (${user.username})`)
        }`,
        inline: false,
    })))
}