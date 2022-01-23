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
                .setName('day')
                .setDescription('Runs by day!')
                .addUserOption(option => option.setName('user').setDescription('The user')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('week')
                .setDescription('Runs by week!')
                .addUserOption(option => option.setName('user').setDescription('The user'))),
        async execute(interaction) {
        const graph = await getGraph(interaction)
        // await interaction.reply({ files: [attachment] });
        await interaction.reply({files: [graph]})
        }
};

async function getGraph(interaction) {
    const chartCallback = (ChartJS) => {}
    let data = await getData(interaction.user.id, interaction.options._subcommand)
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
        let data1 = await getData(interaction.options._hoistedOptions[0].user.id, interaction.options._subcommand)
        let dates1 = data1[0]
        let distances1 = data1[1]
        if (dates1.length > dates.length) {
            config.data.labels = dates1.reverse()
            for (let i = 0; i < dates1.length - dates.length; i++) {
                distances.push(0)
            }
            config.data.datasets[0].data = distances.reverse()
        } else {
            for (let i = 0; i < dates.length - dates1.length; i++) {
                distances1.push(0)
            }
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


async function getData(id, subcommand, ) {
    const statistics = await User.findOne({discord_id : parseInt(id)}, 'statistics')
    let distances = []
    let dates = []
    const max_inactive_days = 7
    let num_days = 0
    let inactive_days = 0
    let data_found = false
    let last_date
    for (let num_week = 0; num_week < statistics.statistics.length; num_week++) {
        const week = statistics.statistics[num_week]
        if (subcommand == 'day') {
            for (let num_day = 6; num_day > -1; num_day--) {
                var d = new Date();
                if (num_week == 0 && num_day > (d.getDay() + 6) % 7) {
                    continue
                }
                const day = week.statistics_by_day[num_day]
                const new_date = new Date(week.week_starting)
                new_date.setDate(new_date.getDate() + num_day)
                dates.push(new_date.getDate() + '/' + 
                (new_date.getMonth() + 1))
                distances.push(day.total_distance)
                if (day.total_distance == 0) {
                    inactive_days++
                } else {
                    inactive_days = 0
                }
                if (inactive_days == max_inactive_days) {
                    console.log(distances)
                    distances = distances.slice(0, distances.length - max_inactive_days + 1);
                    dates = dates.slice(0, dates.length - max_inactive_days + 1);
                    data_found = true
                    console.log(distances)
                    break
                }
                num_days ++
                last_date = new_date
            }
            if (data_found) break
        } else if (subcommand == 'week') {
            const new_date = new Date(week.week_starting)
            dates.push(new_date.getDate() + '/' + (new_date.getMonth() + 1))
            distances.push(week.total_distance)
            last_date = new_date
        }
    }
    if (!data_found) {
        distances.push(0)
        if (subcommand == 'day') {
            last_date.setDate(last_date.getDate() - 1)
        } else {
            last_date.setDate(last_date.getDate() - 1)
        }
        dates.push(last_date.getDate() + '/' + (last_date.getMonth() + 1))
        console.log(last_date)
        // dates.push()
    }
    return [dates, distances]
}

