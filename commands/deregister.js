const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');
const Guild  = require('../models/Guild');
const User  = require('../models/User');
const dotenv = require('dotenv');

dotenv.config()

module.exports = {
	data: new SlashCommandBuilder()
    .setName('deregister')
    .setDescription('Deregister yourself from this server\'s competition.'),
    async execute(interaction) {

      const guild = await Guild.findOne({guildId : interaction.guild.id})

      const removeIndex = guild.members.findIndex(member => member.id === interaction.user.id);
      if (removeIndex > -1) { // only splice array when item is found
        guild.members.splice(removeIndex, 1); // 2nd parameter means remove one item only
        await guild.save()
        await interaction.reply({content: `Successfully unlinked from Achilles leaderboard!`, ephemeral: true})
      } else {
        await interaction.reply({content: `Not currently registered to Achilles leaderboard, user command \\register`, ephemeral: true})
      }
    }
};