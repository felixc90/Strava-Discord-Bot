const { SlashCommandBuilder } = require('@discordjs/builders');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const { MessageAttachment, MessageEmbed } = require('discord.js');
const { registerFont } = require("canvas")
const User = require('../models/User')
const { getStartOfPeriod } = require('./otherHelper')

module.exports = {
    getSingleGraph : getSingleGraph,
    // getDoubleGraph : getDoubleGraph
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

    const user = await User.findOne({discord_id : interaction.user.id})
    const runs = (await user.statistics.populate({path: 'runs'})).runs

    let time_unit = interaction.options._subcommand
    let data = await getMileageData(runs, time_unit)
    const image = await canvas.renderToBuffer(getConfig(interaction, data))
    const attachment = new MessageAttachment(image)
    return attachment
}

function getConfig(interaction, data) {
    return config = {
        type: 'line',
        data: {
            labels: data.dates.reverse(),
            datasets: [
                {
                    label: interaction.user.username,
                    data: data.distances.reverse(),
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
                            family: 'Courier',
                            size: 20,
                            weight: '500',
                        }
                    }
                },
                title: {
                    display: true,
                    text:`${interaction.user.username}'s Mileage (Last ${data.dates.length} ${interaction.options._subcommand}s)`,
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
}


async function getNumActivePeriods(runs, time_unit) {
    let prev_run = {date: new Date()}
    let num_active_periods = 0;
    for (const curr_run of runs) {
        let difference = (getStartOfPeriod(prev_run.date, time_unit) - 
        getStartOfPeriod(curr_run.date, time_unit)) / (1000 * 3600 * 24)
        if (time_unit == "week") (difference = difference / 7)
        if ((time_unit == "day" && difference > 7) ||
            (time_unit == "week" && difference > 4)) {break}
        prev_run = curr_run
        num_active_periods += 1
    }
    return num_active_periods
}


async function getMileageData(runs, time_unit) {
    let active_periods = await getNumActivePeriods(runs, time_unit)
    let index = 0
    let dates = []
    let distances = []
    let curr_date = getStartOfPeriod(new Date(), time_unit)
    while (index < active_periods) {
        while (curr_date.getTime() == getStartOfPeriod(runs[index].date, time_unit).getTime()) {
            if (dates.length > 0 && curr_date.getTime() == dates[dates.length - 1].getTime()) {
                distances[distances.length - 1] += runs[index].distance
            } else {
                dates.push(curr_date)
                distances.push(runs[index].distance)
            }
            index += 1
        }
        if (index == active_periods) {break}
        curr_date = getStartOfPeriod(curr_date - 1, time_unit)
        dates.push(curr_date)
        distances.push(0)
    }
    // Bug here
    // console.log(distances, dates)
    while (dates.length < (time_unit == "day" ? 7 :4)) {
        curr_date = getStartOfPeriod(curr_date - 1, time_unit)
        dates.push(curr_date)
        distances.push(0)
    }
    dates = dates.map((date) => date.getDate() + '/' + 
    (date.getMonth() + 1))
    return {
        dates: dates,
        distances, distances
    }
}

function toPace(speed) {
    return `${parseInt(speed)}:${parseInt((speed - parseInt(speed)) * 60)}`
}