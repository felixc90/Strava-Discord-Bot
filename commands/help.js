const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Updates the weekly stats'),
    async execute(interaction) {
    const helpEmbed = new MessageEmbed()
      .setColor('#0099ff')
      .setTitle(`Achilles Bot Help`)
      .addFields(
          {'name' : '💯 Register User - `/register`', 'value': 'Registers the user to the server competition.', 'inline': false},
          {'name' : '🛑 Deregister User - `/deregister`', 'value': 'Deregisters the user\'s from the server competition.', 'inline': false},
          {'name' : '🏃‍♂️ Athlete Profile - `/profile`', 'value': 'Shows athlete profile and some quick statistics.', 'inline': false},
          {'name' : '👟 Graph - `/graph <period> <n> <name>`', 'value': 'Displays a graph of specified users\' activities for the last n periods.', 'inline': false},
          {'name' : '🚀 Leaderboard - `/leaderboard`',
          'value': 'Displays the weekly Strava leaderboard based on distance.', 'inline': false},
          {'name' : '⚡️ Force Update - `/update`', 'value': 'Updates the weekly statistics.', 'inline': false},
          {'name' : '👻 Delete User - `/delete <confirmation>`', 'value': 'Deletes the user from Achilles.', 'inline': false},
      )
      await interaction.reply({embeds : [helpEmbed]})
    }
};