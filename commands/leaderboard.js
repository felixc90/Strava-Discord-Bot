const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');
const User = require('../models/User')


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
            let useTime = true;
            if (interaction.options.getSubcommand() === 'distance') {
                useTime = false;
            }
            let leaderboard = await getLeaderboard(useTime)
            const leaderboardEmbed = {
                color: 0x0099ff,
                title: `Weekly Strava Leaderboard`,
                url: 'https://www.strava.com/oauth/authorize?client_id=71610&response_type=code&redirect_uri=https://still-caverns-77918.herokuapp.com/add-user&approval_prompt=force&scope=activity:read',
                description: `=======based on ${useTime ? 'time' : 'distance'}=======`,
                thumbnail: {
                    url: 'https://imgur.com/5IUqGhY.png',
                },
                fields: leaderboard,
                timestamp: new Date(),
                footer: {
                    text: "\u200b\nOnly the disciplined ones are free in life.\n - Eliud Kipchoge"
                },
            };
            const update = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('update')
					.setLabel('Update')
					.setStyle('PRIMARY'),
			);

        await interaction.reply({ embeds: [leaderboardEmbed], components: [update]})
        }
};

async function getLeaderboard(useTime) {
    medals = ['\u200b\n🥇','🥈','🥉', '4th', '5th','6th','7th','8th','9th','10th']
    const users = await User.find({})
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