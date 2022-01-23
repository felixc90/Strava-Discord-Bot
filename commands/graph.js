const { SlashCommandBuilder } = require('@discordjs/builders');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const { MessageAttachment, MessageEmbed } = require('discord.js');
const {registerFont} = require("canvas")
const User = require('../models/User')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('graph')
		.setDescription('Displays a graph')
        .addSubcommand(subcommand =>
            subcommand
                .setName('by day')
                .setDescription('Runs by day!'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('by week')
                .setDescription('Runs by week!')),
        async execute(interaction) {
        const chartCallback = (ChartJS) => {}
        const data = await getData(interaction)
        const width = 1200
        const height = 800
        const canvas = new ChartJSNodeCanvas({
            width,
            height,
            chartCallback,
            backgroundColour: '#222732'
        }, )
        registerFont("./CourierPrime-Regular.ttf", { family: "Courier" })
        let distances = data[1]
        let dates = data[0]
        // let times = data[2]
        let byDay = interaction.options._subcommand == 'day'
        const config = {
            type: 'line',
            data: {
                labels: dates.reverse(),
                datasets: [
                    {
                        data: distances.reverse(),
                        backgroundColor: function (context) {
                            const gradient = context.chart.ctx.createLinearGradient(600, 0, 600, 800);
                            if (byDay) {
                                gradient.addColorStop(0, 'rgba(0, 231, 255, 0.9)')
                                gradient.addColorStop(0.5, 'rgba(0, 231, 255, 0.25)');
                                gradient.addColorStop(1, 'rgba(0, 231, 255, 0)');
                            } else {
                                gradient.addColorStop(0, 'rgba(255, 0,0, 0.5)')
                                gradient.addColorStop(0.5, 'rgba(255, 0, 0, 0.25)');
                                gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
                            }
                            return gradient;
                        },
                        borderWidth: 1,
                        pointBackgroundColor: 'white',
                        pointBorderColor: 'white',
                        borderColor: byDay ? '#05CBE1' : '#FC2525',
                        fill: true,
                        cubicInterpolationMode: 'monotone',
                        tension: 0.2,
                        yAxisID: 'y',
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
                        display:false,
                    },
                    title: {
                        display: true,
                        text: `${interaction.user.username}'s Mileage (Last ${dates.length} ${interaction.options._subcommand}s)`,
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
                    y1: {
                        ticks: {
                            // Include a dollar sign in the ticks
                            callback: function(value, index, ticks) {
                                return value + 'min';
                            },
                            color: 'white',
                            font: {
                                family: 'Courier',
                                size: 20,
                                weight: '500',
                            }
                        },
                        position: 'right'
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
        const image = await canvas.renderToBuffer(config)
        const attachment = new MessageAttachment(image)
    
        await interaction.reply({ files: [attachment] });
        }
};


async function getData(interaction) {
    const statistics = await User.findOne({discord_id : parseInt(
        interaction.user.id
    )}, 'statistics')
    let distances = []
    let dates = []
    let times = []
    const max_inactive_days = 7
    let num_days = 0
    let inactive_days = 0
    let data_found = false
    for (let num_week = 0; num_week < statistics.statistics.length; num_week++) {
        const week = statistics.statistics[num_week]
        if (interaction.options._subcommand == 'day') {
            for (let num_day = 6; num_day > -1; num_day--) {
                var d = new Date();
                if (num_week == 0 && num_day > (d.getDay() + 6) % 7) {
                    continue
                }
                // console.log(week.statistics_by_day.length, num_week, num_day)
                const day = week.statistics_by_day[num_day]
                // console.log(num_day, day)
                const new_date = new Date(week.week_starting)
                new_date.setDate(new_date.getDate() + num_day)
                dates.push(new_date.getDate() + '/' + 
                (new_date.getMonth() + 1))
                distances.push(day.total_distance)
                times.push(parseInt(day.total_time))
                if (day.total_distance == 0) {
                    // console.log(dates[dates.length - 1])
                    inactive_days++
                } else {
                    inactive_days = 0
                }
                if (inactive_days == max_inactive_days) {
                    distances = distances.slice(0, distances.length - max_inactive_days + 1);
                    times = times.slice(0, times.length - max_inactive_days + 1);
                    dates = dates.slice(0, dates.length - max_inactive_days + 1);
                    data_found = true
                    break
                }
                num_days ++
                if (num_days == 30) {
                    data_found = true
                    break
                }
            }
            if (data_found) break
        } else if (interaction.options._subcommand == 'week') {
            const new_date = new Date(week.week_starting)
            dates.push(new_date.getDate() + '/' + (new_date.getMonth() + 1))
            distances.push(week.total_distance)
            times.push(week.total_time)
        }
    }
    return [dates, distances, times]
}