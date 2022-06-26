const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('Displays the weekly leaderboard!'),
        async execute(interaction) {
        const leaderboardEmbed = await getLeaderboardEmbed(guild.use_time, guild.guild_id, 1)
        const leaderboardRow = getRow(guild.use_time, 1)
        await interaction.reply({ embeds: [leaderboardEmbed], components: [leaderboardRow]})
        },
    getLeaderboardEmbed: getLeaderboardEmbed,
    getRow: getRow
};

async function getLeaderboardEmbed(useTime, guildId, pageNum) {
    let leaderboard = await getLeaderboard(useTime, guildId, pageNum)
    const leaderboardEmbed = new MessageEmbed()
    .setColor('#05CBE1')
    .setTitle(`Weekly Strava Leaderboard`)
    .setDescription('======based on distance======')
    .setThumbnail('https://i.imgur.com/xJXLhW3.png')
    .addFields(leaderboard)
    .setTimestamp()
    .setFooter(`\u200b\n Page ${pageNum}`);

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
            .setLabel(`Use Time`)
            .setStyle('DANGER'),
        new MessageButton()
            .setCustomId('change-page')
            .setLabel('Next Page')
            .setStyle('SECONDARY'),
    );
    return row
}
async function getLeaderboard(useTime, guildId, pageNum) {
    medals = ['\u200b\n🥇','🥈','🥉', '4th', '5th','6th','7th','8th','9th','10th']
    


    if (users.length == 0) return {name: '👻', value: 'No records to show...', inline: false}
    const start = pageNum == 1 ? 0 : 5
    const end = pageNum == 1 ? 5 : 10
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