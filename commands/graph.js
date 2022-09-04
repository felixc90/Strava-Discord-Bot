const { SlashCommandBuilder } = require('@discordjs/builders');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const { MessageAttachment, MessageEmbed } = require('discord.js');
const { registerFont } = require("canvas")
const User = require('../models/User')
const { getTimeGraph } = require('../utils/graph')
const { getRunData } = require('../utils/helper')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('graph')
		.setDescription('Shows the mileage for user and others in a graph!')
        .addStringOption(option =>
            option.setName('period')
			.setDescription('Choose length of time period')
			.setRequired(true)
			.addChoices(
                { name: 'day', value: 'day' },
                { name: 'week', value: 'week' },
                { name: 'month', value: 'month' },
                { name: 'year', value: 'year' }
			))
        .addUserOption(option => option.setName('user').setDescription('Comparing with user'))
        ,
        async execute(interaction) {
            const unit_of_time = interaction.options._hoistedOptions.filter(option => option.name == 'period')[0].value
            let run_data = await getRunData(interaction.user.id, unit_of_time, -1)
            const datasets = [{
                username : interaction.user.username,
                dates : run_data.dates,
                data : run_data.distances
            }]
            if (interaction.options._hoistedOptions.filter(option => option.name == 'user').length > 0) {
                let other = interaction.options._hoistedOptions.filter(option => option.name == 'user')[0]
                run_data = await getRunData(other.user.id, unit_of_time, -1)
                datasets.push({
                    username : other.user.username,
                    dates : run_data.dates,
                    data : run_data.distances
                })
            }
            let min_length = Math.min(datasets.map(dataset => dataset.length))
            datasets.map(dataset => { 
                return {
                    username : dataset.username,
                    dates : dataset.dates.reverse().slice(0, min_length),
                    data : dataset.data.reverse().slice(0, min_length) 
                }
            })
            const graph = await getTimeGraph({
                time_unit : unit_of_time,
                labels : datasets[0].dates,
                datasets : datasets
            })
            
            await interaction.reply({files: [graph]})
        }
};