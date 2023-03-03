const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');
const Guild  = require('../models/Guild');
const User  = require('../models/User');
const dotenv = require('dotenv');

dotenv.config()

module.exports = {
	data: new SlashCommandBuilder()
    .setName('reset')
    .setDescription('Reset data of all users [testing use only]'),
    async execute(interaction) {
      const guild = await Guild.findOne({guildId: interaction.guild.id})
      const users = await User.find({discordId : { $in: guild.members.map(member => member.id) }})
      var date = new Date();
      date.setDate( date.getDate() - 6 );
      date.setFullYear( date.getFullYear() - 1 );
      for (const user of users) {
        user.totalDistance = 0;
        user.totalRuns = 0;
        user.totalTime = 0;
        user.runs = new Array();
        user.lastUpdated = date;
        await user.save();
      }
      await interaction.reply({content: `Reset all user data`, ephemeral: true})
    }
};