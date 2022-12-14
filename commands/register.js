const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');
const Guild  = require('../models/Guild');
const User  = require('../models/User');
const dotenv = require('dotenv');

dotenv.config()

module.exports = {
	data: new SlashCommandBuilder()
    .setName('register')
    .setDescription('Register your Strava account with Achilles!'),
    async execute(interaction) {
      const user = await User.findOne({discordId : interaction.user.id})

      // user is not found i.e. needs to registered
      if (user == null) {
        let url = 'https://www.strava.com/oauth/authorize?client_id=71610' + 
        '&response_type=code&redirect_uri=' +
        `${process.env.URL}user/register` + 
        `/${interaction.guild.id}` +
        `/${interaction.user.id}` + 
        `/${interaction.user.username}` + 
        '&approval_prompt=force&scope=activity:read'
        // replace line above with the following code to gain write permissions
        // '&approval_prompt=force&scope=activity:write,activity:read'
        const row = new MessageActionRow()
          .addComponents(
            new MessageButton()
            .setLabel('Click here!')
            .setStyle('LINK')
            .setURL(url),
          );
        // reply with button which links Strava
        await interaction.reply({content:'Register your Strava account with Achilles', 
          components: [row], ephemeral: true})
      // user is found in the database i.e. we can use previous user data
      } else {
        const guild = await Guild.findOne({guildId : interaction.guild.id})
        // if user is not registered in the guild's competition
        if (!guild.members.map(member => member.id).includes(interaction.user.id)) {
          guild.members.push({
              'id' : user.discordId,
              'joinedAt' : new Date(),
              'totalExp' : 0,
              'modifiers' : [],
              'mostRecentRunId' : -1,
              'logEntries' : []
          })
          await guild.save()
          await interaction.reply({content: `${interaction.user.username} registered in ${interaction.guild.name} leaderboard!`, ephemeral: true})
        // if user is registered in the guild's competition
        } else {
          await interaction.reply({content: `${interaction.user.username} already registered in ${interaction.guild.name} leaderboard!`, ephemeral: true})
        }
      }
      return;

      
    }
};