const { SlashCommandBuilder } = require('@discordjs/builders');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const { MessageAttachment, MessageEmbed } = require('discord.js');
const { registerFont } = require("canvas")
const { getSingleTable, getDoubleTable } = require('../helpers/statisticsHelper')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('statistics')
		.setDescription('Shows the statistics for user and others in a table')
        .addSubcommand(subcommand =>
            subcommand
                .setName('day')
                .setDescription('Statistics by day!')
                .addUserOption(option => option.setName('user').setDescription('The user')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('week')
                .setDescription('Statistics by week!')
                .addUserOption(option => option.setName('user').setDescription('The user')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('all-time')
                .setDescription('All-Time Statistics!')
                .addUserOption(option => option.setName('user').setDescription('The user'))),
        async execute(interaction) {
        const table = interaction.options._hoistedOptions.length == 0 ? 
            await getSingleTable(interaction) : await getDoubleTable(interaction)
        if (typeof table === 'string') {
            table = new MessageEmbed()
            .setColor('#05CBE1')
            .setDescription('❗️**' + table + '** is not registered❗️\n\n Use `/register` to add to the database. ✨')
        }
        await interaction.reply({embeds : [table]})
    }
};