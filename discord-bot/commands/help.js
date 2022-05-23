const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Updates the weekly stats'),
        async execute(interaction) {
        const helpEmbed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`Achilles Bot Help`)
            .addFields(
                {'name' : '💯 Register User - `/register`', 'value': 'Adds the user\'s statistics to the server.', 'inline': false},
                {'name' : '🏃‍♂️ Athlete Profile - `/profile`', 'value': 'Shows athlete profile and some quick statistics.', 'inline': false},
                {'name' : '👟 Mileage Graph - `/mileage <time unit> <name>`', 'value': 'Displays a graph of specified users\' recent activity.', 'inline': false},
                {'name' : '⏱ Statistics - `/statistics <time unit> <name>`', 'value': 'Compares users\' statistics over time using tabular data.', 'inline': false},
                {'name' : '🎉  Display Leaderboard - `/leaderboard`',
                'value': 'Displays the weekly Strava leaderboard based on time or distance.', 'inline': false},
                {'name' : '⚡️ Force Update - `/update`', 'value': 'Force updates the weekly statistics.', 'inline': false},
                {'name' : '🚩 Flag - `/flag`', 'value': 'Shows various points of interest (flags) to user.', 'inline': false}
            )
        await interaction.reply({embeds : [helpEmbed]})
        }
};