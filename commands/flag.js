const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const dotenv = require('dotenv')
dotenv.config()

module.exports = {
	data: new SlashCommandBuilder()
		.setName('flag')
		.setDescription('Shows POIs within athlete\'s routes'),
        async execute(interaction) {
        await interaction.reply({content : `${process.env.FLAG}`})
        }
};