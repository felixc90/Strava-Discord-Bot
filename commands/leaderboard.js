const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const User = require('../models/User')
const Guild = require('../models/Guild')


module.exports = {
	data: new SlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('Displays the weekly Strava leaderboard!')
        .addSubcommand(subcommand =>
            subcommand
                .setName('time')
                .setDescription('What ran the most minutes?'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('distance')
                .setDescription('What ran the most kilometres?')),
        async execute(interaction) {
            // console.log(interaction)
            let useTime = true;
            if (interaction.options.getSubcommand() === 'distance') {
                useTime = false;
            }
            let leaderboard = await getLeaderboard(useTime, interaction.guild.id)
            const leaderboardEmbed = new MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`Weekly Strava Leaderboard`)
                .setDescription(`=======based on ${useTime ? 'time' : 'distance'}=======`)
                .setThumbnail('https://imgur.com/5IUqGhY.png')
                .addFields(leaderboard)
                .setTimestamp()
                .setFooter("\u200b\nOnly the disciplined ones are free in life.\n - Eliud Kipchoge");
        await interaction.reply({ embeds: [leaderboardEmbed]})
        }
};

async function getLeaderboard(useTime, guild_id) {
    medals = ['\u200b\n🥇','🥈','🥉', '4th', '5th','6th','7th','8th','9th','10th']
    const guild = await Guild.find({guild_id: guild_id})
    const users = await User.find({discord_id : { $in: guild[0].members } })
    if (users.length == 0) return {name: '👻', value: 'No records to show...', inline: false}
    users.sort((user1, user2) =>  useTime ? 
        user2.weekly_stats.total_time - user1.weekly_stats.total_time:
        user2.weekly_stats.total_distance - user1.weekly_stats.total_distance
    )
    return (users.slice(0, 10).map(user => ({
        name: `${medals[users.indexOf(user)]}`,
        value: `${
            useTime ? 
                parseInt(user.weekly_stats.total_time) + 'min' :
                Math.round(parseInt(user.weekly_stats.total_distance)*100)/100.0 + 'km'} | ${
            user.name + (user.username === null ? '' : ` (${user.username})`)
        }`,
        inline: false,
    })))
}