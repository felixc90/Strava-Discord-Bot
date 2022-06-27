const { SlashCommandBuilder } = require('@discordjs/builders');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const { MessageAttachment, MessageEmbed } = require('discord.js');
const { registerFont } = require("canvas")
const User = require('../models/User')
const { getSingleGraph, getDoubleGraph } = require('../helpers/mileageHelper')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mileage')
		.setDescription('Shows the mileage for user and others in a graph!')
        .addSubcommand(subcommand =>
            subcommand
                .setName('day')
                .setDescription('Mileage by day!')
                .addUserOption(option => option.setName('user').setDescription('The user')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('week')
                .setDescription('Mileage by week!')
                .addUserOption(option => option.setName('user').setDescription('The user'))),
        async execute(interaction) {
        const graph = interaction.options._hoistedOptions.length == 0 ? 
            await getSingleGraph(interaction) : await getDoubleGraph(interaction)
        if (typeof graph === 'string') {
            const embed = new MessageEmbed()
            .setColor('#05CBE1')
            .setDescription('❗️**' + graph + '** is not registered❗️\n\n Use `/register` to add to the database. ✨')
            await interaction.reply({embeds: [embed]});
            return
        }
        await interaction.reply({files: [graph]})
    }
};