const { SlashCommandBuilder } = require('@discordjs/builders');
const fetch = require('node-fetch');
const dotenv = require('dotenv');

dotenv.config()

module.exports = {
	data: new SlashCommandBuilder()
		.setName('update')
		.setDescription('Updates the weekly stats'),
        async execute(interaction) {
        await fetch(
            `${process.env.URL}update-users`,{
            method: 'put',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                guild_id: interaction.guild.id,
            })
        })
        await interaction.reply({content : '⚡️Stats have been updated!⚡️'})
        }
};