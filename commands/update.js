const { SlashCommandBuilder } = require('@discordjs/builders');
const dotenv = require('dotenv');
const { updateUsers } = require('../utils/update')

dotenv.config()


module.exports = {
	data: new SlashCommandBuilder()
		.setName('update')
		.setDescription('Force update each athlete\'s Strava data'),
    async execute(interaction) {
      await interaction.deferReply();
      await updateUsers(interaction.guild.id)
      await interaction.editReply('Users have been updated with most recent Strava data!');
    },
};