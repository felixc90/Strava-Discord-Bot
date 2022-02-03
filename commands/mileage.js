const { SlashCommandBuilder } = require('@discordjs/builders');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const { MessageAttachment, MessageEmbed } = require('discord.js');
const { toPace, getData } = require('../helpers.js')
const {registerFont} = require("canvas")
const User = require('../models/User')

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
        const graph = await getGraph(interaction)
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

async function getGraph(interaction) {
    const chartCallback = (ChartJS) => {}
    let user = await User.findOne({discord_id : parseInt(interaction.user.id)}, 'statistics days_last_active')
    if (user == null) return interaction.user.username
    let subcommand = interaction.options._subcommand
    let num = subcommand == 'day' ? user.days_last_active : user.statistics.length + 1
    var user1
    if (interaction.options._hoistedOptions.length != 0) {
        user1 = await User.findOne({discord_id : parseInt(interaction.options._hoistedOptions[0].user.id)}, 'statistics days_last_active')
        if (user1 == null) return interaction.options._hoistedOptions[0].user.username
        if (user1.days_last_active > user.days_last_active && subcommand == 'day') num = user1.days_last_active
        if (user1.statistics.length > user.statistics.length && subcommand == 'week') num = user1.statistics.length + 1
    } 

    let data = await getData(user.statistics, interaction.options._subcommand, num)
    const width = 1400
    const height = 900
    const canvas = new ChartJSNodeCanvas({
        width,
        height,
        chartCallback,
        backgroundColour: '#222732'
    }, )
    registerFont("./CourierPrime-Regular.ttf", { family: "Courier" })
    let dates = data[0]
    let distances = data[1]
    const config = {
        type: 'line',
        data: {
            labels: dates.reverse(),
            datasets: [
                {
                    label: interaction.user.username,
                    data: distances.reverse(),
                    backgroundColor: function (context) {
                        const gradient = context.chart.ctx.createLinearGradient(600, 0, 600, 800);
                        gradient.addColorStop(0, 'rgba(0, 231, 255, 0.9)')
                        gradient.addColorStop(0.5, 'rgba(0, 231, 255, 0.25)');
                        gradient.addColorStop(1, 'rgba(0, 231, 255, 0)');
                        return gradient;
                    },
                    borderWidth: 1,
                    pointBackgroundColor: 'white',
                    pointBorderColor: 'white',
                    borderColor: '#05CBE1',
                    fill: true,
                    cubicInterpolationMode: 'monotone',
                    tension: 0.2,
                },
            ],
            
        },
        options: {
            layout: {
                padding: {
                    right: 40,
                    left: 20,
                    up: 20,
                    bottom: 20,
                }
            },
            plugins : {
                legend: {                        
                    display:(interaction.options._hoistedOptions.length != 0),
                    labels : {
                        color: 'white',
                        font: {
                            family: 'Courier',
                            size: 20,
                            weight: '500',
                        }
                    }
                },
                title: {
                    display: true,
                    text: ((interaction.options._hoistedOptions.length == 0) ?
                    `${interaction.user.username}'s` : 
                    `${interaction.user.username} v ${interaction.options._hoistedOptions[0].user.username}`)
                    + ` Mileage (Last ${dates.length} ${interaction.options._subcommand}s)`,
                    font: {
                        size: 30,
                        family: 'Courier'
                    },
                    padding: {
                        top: 15,
                        bottom: 20,
                    },
                    color: 'white',
                }
            },
            scales: {
                y: {
                    ticks: {
                        // Include a dollar sign in the ticks
                        callback: function(value, index, ticks) {
                            return value + 'km';
                        },
                        color: 'white',
                        font: {
                            family: 'Courier',
                            size: 20,
                            weight: '500',
                        }
                    },
                    position: 'left'
                },
                x: {
                    ticks: {
                        color: 'white',
                        font: {
                            family: 'Courier',
                            size: 20,
                            weight: '500',
                        }
                    }
                }
            }
        }
    }
    if (interaction.options._hoistedOptions.length != 0) {
        let data1 = await getData(user1.statistics, interaction.options._subcommand, num)
        let dates1 = data1[0]
        let distances1 = data1[1]
        if (dates1.length > dates.length) {
            config.data.labels = dates1.reverse()
        }

        config.data.datasets.push({
            label: interaction.options._hoistedOptions[0].user.username,
            data: distances1.reverse(),
            backgroundColor: function (context) {
                const gradient = context.chart.ctx.createLinearGradient(600, 0, 600, 800);
                gradient.addColorStop(0, 'rgba(255, 0,0, 0.5)')
                gradient.addColorStop(0.5, 'rgba(255, 0, 0, 0.25)');
                gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
                return gradient;
            },
            borderWidth: 1,
            pointBackgroundColor: 'white',
            pointBorderColor: 'white',
            borderColor: '#FC2525',
            fill: true,
            cubicInterpolationMode: 'monotone',
            tension: 0.2,
        })

    
    }
    const image = await canvas.renderToBuffer(config)
    const attachment = new MessageAttachment(image)
    return attachment
}