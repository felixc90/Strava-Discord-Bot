const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');
const Guild  = require('../models/Guild');
const User  = require('../models/User');
const dotenv = require('dotenv');

dotenv.config()

module.exports = {
	data: new SlashCommandBuilder()
    .setName('delete')
    .setDescription('Delete your account from Achilles permanently.')
    .addStringOption(option => option.setName('confirm')
      .setDescription('Type your discord username to confirm deletion')
      .setRequired(true)
    ),
    async execute(interaction) {
      if (! (await User.findOne({discordId : interaction.user.id}))) {
        await interaction.reply(`Error occurred: ${interaction.user.username} not registered to Achilles`)
      }
      const username = interaction.options._hoistedOptions.filter(option => option.name == 'confirm')[0].value
      if (username === interaction.user.username) {
        const guilds = await Guild.find({members: {$elemMatch: {id: interaction.user.id}}})
        console.log(guilds)
        guilds.forEach(guild => {
          guild.members = guild.members.filter(member => member.id !== interaction.user.id)
          guild.save()
        })
        await User.deleteOne({discordId : interaction.user.id})
        await interaction.reply(`${interaction.user.username} successfully deleted from Achilles.`)
      } else {
        await interaction.reply(`Error occurred: usernames do not match!`)
      }
    }
};