const { SlashCommandBuilder } = require('@discordjs/builders');
const fetch = require('node-fetch');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('update')
		.setDescription('Updates the weekly stats'),
        async execute(interaction) {
        fetch(
            'https://still-caverns-77918.herokuapp.com' +
            // 'http://localhost:3000' +
        '/update-users',{
            method: 'put',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                guild_id: interaction.guild.id,
            })
        })
        await interaction.reply({content : 'lol'})
        }
};