const fetch = require('node-fetch');
const User = require('../models/User')
const { togglePage } = require('../utils/pages')
const { getFields } = require('../utils/fields')

module.exports = {
	name: 'interactionCreate',
	async execute(client, interaction) {
    // handle command
    if (interaction.isCommand()) {
      const command = client.commands.get(interaction.commandName)
      if (!command) return
      try {
          console.log(`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction.`);
          await command.execute(interaction)
      } catch (error) {
          console.error(error)
          await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
      }
    // handle button click
    } else if (interaction.isButton()) {
        if (interaction.customId.includes("page")) {
          console.log(interaction)
          fields = await getFields(interaction.message.embeds[0].title.split(" ")
          [interaction.message.embeds[0].title.split(" ").length - 1].toLowerCase(), 
          interaction.user.id, interaction.guild.id)
          response = await togglePage(interaction, fields)
          await interaction.reply({ 
              embeds: [response.replyMessageEmbed], 
              components: [response.replyMessageRow]})
        }
    }
	}
};