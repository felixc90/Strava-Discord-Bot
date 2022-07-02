const { SlashCommandBuilder } = require('@discordjs/builders');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const { MessageAttachment, MessageEmbed } = require('discord.js');
const { registerFont } = require("canvas")
const User = require('../models/User')
const { getMileageData } = require('./dataHelper')

module.exports = {
    getSingleGraph : getSingleGraph,
    getDoubleGraph : getDoubleGraph
}

async function getSingleGraph(interaction) {
    const chartCallback = (ChartJS) => {}
    const width = 1400
    const height = 900
    const canvas = new ChartJSNodeCanvas({
        width,
        height,
        chartCallback,
        backgroundColour: '#222732'
    }, )
    
    registerFont("./assets/CourierPrime-Regular.ttf", { family: "Courier" })
    // registerFont("./assets/ShareTechMono-Regular.ttf", { family: "ShareTech" })

    const user = await User.findOne({discord_id : interaction.user.id})
    const runs = (await user.statistics.populate({path: 'runs'})).runs

    let time_unit = interaction.options._subcommand
    let data = await getMileageData(runs, time_unit)
    const image = await canvas.renderToBuffer(getConfig(interaction, data, null))
    const attachment = new MessageAttachment(image)
    return attachment
}

async function getDoubleGraph(interaction) {
    const chartCallback = (ChartJS) => {}
    const width = 1400
    const height = 900
    const canvas = new ChartJSNodeCanvas({
        width,
        height,
        chartCallback,
        backgroundColour: '#222732'
    }, )
    
    registerFont("./assets/CourierPrime-Regular.ttf", { family: "Courier" })

    const user1 = await User.findOne({discord_id : interaction.user.id})
    const user2 = await User.findOne({discord_id : interaction.options._hoistedOptions[0].user.id})
    if (user2 == null)  {return interaction.options._hoistedOptions[0].user.username }
    const runs1 = (await user1.statistics.populate({path: 'runs'})).runs
    const runs2 = (await user2.statistics.populate({path: 'runs'})).runs

    let time_unit = interaction.options._subcommand
    let data1 = await getMileageData(runs1, time_unit)
    let data2 = await getMileageData(runs2, time_unit)
    min_length = Math.min(data1.dates.length, data2.dates.length)
    // Needs further testing
    data1 = {
        distances: data1.distances.slice(0, min_length),
        dates: data1.dates.slice(0, min_length)
    }
    data2 = {
        distances: data2.distances.slice(0, min_length),
        dates: data2.dates.slice(0, min_length)
    }
    const config = getConfig(interaction, data1, data2);
    const image = await canvas.renderToBuffer(config)
    const attachment = new MessageAttachment(image)
    return attachment
}

function getConfig(interaction, data1, data2) {
    let font = 'ShareTech'
    const config = {
        type: 'line',
        data: {
            labels: data1.dates.reverse(),
            datasets: [
                {
                    label: interaction.user.username,
                    data: data1.distances.reverse(),
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
                display: false,
                labels : {
                    color: 'white',
                    font: {
                        family: font,
                        size: 20,
                        weight: '500',
                    }
                }
            },
            title: {
                display: true,
                text:((data2 == null) ?
                `${interaction.user.username}'s` : 
                `${interaction.user.username} v ${interaction.options._hoistedOptions[0].user.username}`)
                + ` Mileage (Last ${data1.dates.length} ${interaction.options._subcommand}s)`,
                font: {
                    size: 30,
                    family: font
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
                    callback: function(value, index, ticks) {
                        return value + 'km';
                    },
                    color: 'white',
                    font: {
                        family: font,
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
                        family: font,
                        size: 20,
                        weight: '500',
                    }
                }
            }
        }
        }
    }
    if (data2 != null) {
        config.data.datasets.push({
            label: interaction.options._hoistedOptions[0].user.username,
            data: data2.distances.reverse(),
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
    return config
}