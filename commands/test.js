const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const { getUserRuns, getGuildMembers } = require('./../helpers.js')
const fetch = require('node-fetch');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('test')
		.setDescription('test'),
        async execute(interaction) {
            await fetch(`${process.env.URL}guild/weeklydata/${interaction.guild.id}`, {
                method: 'get',
                headers: {'Content-Type': 'application/json'}
            }).then(res => res.json())
                .then(json => console.log(json))
        }
};