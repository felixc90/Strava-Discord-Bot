const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('test')
		.setDescription('Generates a link'),
        async execute(interaction) {
            // console.log(interaction)
            const url =  'https://www.strava.com/oauth/authorize?client_id=71610' + 
            '&response_type=code&redirect_uri=' +
            'http://127.0.0.1:3000/add-user' + 
            `/${interaction.guild.id}` +
            `/${interaction.user.id}` + 
            `/${interaction.user.username}` + 
            '&approval_prompt=force&scope=activity:read'
            console.log(url)
            const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
                .setLabel('Add Yourself')
                .setStyle('LINK')
                .setURL(url),
			);

        await interaction.reply({content:'o', components: [row], ephemeral: true})
        }
};