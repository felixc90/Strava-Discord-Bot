const { SlashCommandBuilder } = require('@discordjs/builders');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const { MessageAttachment, MessageEmbed } = require('discord.js');
const {registerFont} = require("canvas")
const User = require('../models/User')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mileage')
		.setDescription('Shows the mileage for user and others incl. graph and table')
        .addSubcommand(subcommand =>
            subcommand
                .setName('day')
                .setDescription('Statistics by day!')
                .addUserOption(option => option.setName('user').setDescription('The user')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('week')
                .setDescription('Statistics by week!')
                .addUserOption(option => option.setName('user').setDescription('The user'))),
        async execute(interaction) {
        const values = await getGraph(interaction)
        // console.log(graph)
        const graph = values[0]
        if (typeof graph === 'string') {
            const embed = new MessageEmbed()
            .setColor('#05CBE1')
            .setDescription('❗️**' + graph + '** is not registered❗️\n\n Use `/register` to add to the database. ✨')
            await interaction.reply({embeds: [embed]});
            return
        }
        let embed = await getEmbed(interaction, values)
        await interaction.reply({files: [graph], embeds : [embed]})
    }
};

async function getGraph(interaction) {
    const chartCallback = (ChartJS) => {}
    let return_data = []
    let user = await User.findOne({discord_id : parseInt(interaction.user.id)}, 'statistics days_last_active')
    if (user == null) return interaction.user.username
    let subcommand = interaction.options._subcommand
    let num = subcommand == 'day' ? user.days_last_active : user.statistics.length + 1
    var user1
    if (interaction.options._hoistedOptions.length != 0) {
        user1 = await User.findOne({discord_id : parseInt(interaction.options._hoistedOptions[0].user.id)}, 'statistics days_last_active')
        if (user1 == null) return interaction.options._hoistedOptions[0].user.username
        if (user1.days_last_active > user.days_last_active && subcommand == 'day') num = user1.days_last_active
        if (user1.statistics.length > user.statistics.length) num = user1.statistics.length + 1
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
    let times = data[2]
    return_data.push(distances)
    return_data.push(times)
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
        let data1 = await getData(user1.statistics,
            interaction.options._subcommand, num)
        let dates1 = data1[0]
        let distances1 = data1[1]
        let times1 = data1[2]
        return_data.push(distances1)
        return_data.push(times1)
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
    return [attachment, return_data]
}


async function getData(statistics, subcommand, num) {
    console.log(num)
    let distances = []
    let times = []
    let dates = []
    let num_days = 0
    let last_date = new Date()
    let data_found = false
    for (let num_week = 0; num_week < statistics.length; num_week++) {
        const week = statistics[num_week]
        if (subcommand == 'day') {
            for (let num_day = 6; num_day > -1; num_day--) {
                var d = new Date();
                // If day is in the future
                if (num_week == 0 && num_day > (d.getDay() + 6) % 7) {
                    continue
                }
                const day = week.statistics_by_day[num_day]
                const new_date = new Date(week.week_starting)
                new_date.setDate(new_date.getDate() + num_day)
                dates.push(new_date.getDate() + '/' + 
                (new_date.getMonth() + 1))
                distances.push(day.total_distance)
                times.push(day.total_time)
                if (num_days == num) {
                    data_found = true
                    break
                }
                num_days++
                last_date = new_date
            }
            if (data_found) break
        } else if (subcommand == 'week') {
            const new_date = new Date(week.week_starting)
            dates.push(new_date.getDate() + '/' + (new_date.getMonth() + 1))
            distances.push(week.total_distance)
            times.push(week.total_time)
            last_date = new_date
        }
    }
    while (distances.length < num) {
        distances.push(0)
        last_date.setDate(last_date.getDate() - 1)
        dates.push(last_date.getDate() + '/' + (last_date.getMonth() + 1))
    }
    return [dates, distances, times]
}

async function getEmbed(interaction, values) {
    const distances = values[1][0]
    const times = values[1][1]
    const username = interaction.user.username
    const subcommand = interaction.options._subcommand
    let column_width = username.length > 5 ? username.length : 5
    var data = [
        distances.filter((run)=> run != 0).length.toString(),
        parseInt(distances.reduce((a, b) => a + b, 0) / distances.length).toString(),
        distances.filter((run)=> run != 0).length == 0 ? '0' :(parseInt(distances.reduce((a, b) => a + b, 0)) / distances.filter((run)=> run != 0).length).toString(),
        distances.reduce((a, b) => a + b, 0) == 0 ? '0' : (times.reduce((a, b) => a + b, 0) / distances.reduce((a, b) => a + b, 0)).toFixed(2).toString()]
    if (interaction.options._hoistedOptions.length == 0) {
        if (subcommand == 'day') {
            embed = new MessageEmbed()
            .setColor('#05CBE1')
            .setDescription(
            '```'+
            `+------------------------+-${'-'.repeat(column_width)}-+ \n`+
            `|                        | ${username + ' '.repeat(Math.abs(column_width - username.length))} |\n`+
            `+------------------------+-${'-'.repeat(column_width)}-+ \n`+
            `| Num. of Runs           | ${data[0]+' '.repeat(Math.abs(column_width - data[0].length))} |\n`+
            `+------------------------+-${'-'.repeat(column_width)}-+ \n`+
            `| Daily Average (km)     | ${data[1]+' '.repeat(Math.abs(column_width - data[1].length))} |\n`+
            `+------------------------+-${'-'.repeat(column_width)}-+ \n`+
            `| Avg. Run Distance (km) | ${data[2]+' '.repeat(Math.abs(column_width - data[2].length))} |\n`+
            `+------------------------+-${'-'.repeat(column_width)}-+ \n`+
            `| Avg. Pace (min/km)     | ${data[3]+' '.repeat(Math.abs(column_width - data[3].length))} |\n`+
            `+------------------------+-${'-'.repeat(column_width)}-+ \n`+
            '```')
        } else {
            let user = await User.findOne({discord_id : parseInt(interaction.user.id)}, 'statistics days_last_active')
            data[0] = ((user.statistics.map((week) => week.statistics_by_day.filter((day) => day.total_distance != 0).length)).reduce((a, b) => a + b, 0)).toString()
            data[3] = distances.reduce((a, b) => a + b, 0).toFixed(2).toString()
            embed = new MessageEmbed()
            .setColor('#05CBE1')
            .setDescription(
            '```'+
            `+------------------------+-${'-'.repeat(column_width)}-+ \n`+
            `|                        | ${username + ' '.repeat(Math.abs(column_width - username.length))} |\n`+
            `+------------------------+-${'-'.repeat(column_width)}-+ \n`+
            `| Num. of Runs           | ${data[0]+' '.repeat(Math.abs(column_width - data[0].length))} |\n`+
            `+------------------------+-${'-'.repeat(column_width)}-+ \n`+
            `| Avg. Mileage (km)      | ${data[1]+' '.repeat(Math.abs(column_width - data[1].length))} |\n`+
            `+------------------------+-${'-'.repeat(column_width)}-+ \n`+
            `| Avg. Pace (min/km)     | ${data[2]+' '.repeat(Math.abs(column_width - data[2].length))} |\n`+
            `+------------------------+-${'-'.repeat(column_width)}-+ \n`+
            `| Total Distance (km)    | ${data[3]+' '.repeat(Math.abs(column_width - data[3].length))} |\n`+
            `+------------------------+-${'-'.repeat(column_width)}-+ \n`+
            '```')
    }
    } else{
        const username1 = interaction.options._hoistedOptions[0].user.username
        const distances1 = values[1][2]
        const times1 = values[1][3]
        let column_width1 = username1.length > 5 ? username1.length : 5
        data.push(distances1.filter((run)=> run != 0).length.toString()),
        data.push(parseInt(distances1.reduce((a, b) => a + b, 0) / distances1.length).toString()),
        data.push(distances1.filter((run)=> run != 0).length == 0 ? '0' :(parseInt(distances1.reduce((a, b) => a + b, 0)) / distances1.filter((run)=> run != 0).length).toString()),
        data.push(distances1.reduce((a, b) => a + b, 0) == 0 ? '0' : (times1.reduce((a, b) => a + b, 0) / distances1.reduce((a, b) => a + b, 0)).toFixed(2).toString())
        if (subcommand == 'day') {
            embed = new MessageEmbed()
            .setColor('#FC2525')
            .setDescription(
            '```'+
            `+------------------------+-${'-'.repeat(column_width)}-+-${'-'.repeat(column_width1)}-+ \n`+
            `|                        | ${username + ' '.repeat(Math.abs(column_width - username.length))} | ${username1 + ' '.repeat(Math.abs(column_width1 - username1.length))} |\n`+
            `+------------------------+-${'-'.repeat(column_width)}-+-${'-'.repeat(column_width1)}-+ \n`+
            `| Num. of Runs           | ${data[0]+' '.repeat(Math.abs(column_width - data[0].length))} | ${data[4]+' '.repeat(Math.abs(column_width1 - data[4].length))} |\n`+
            `+------------------------+-${'-'.repeat(column_width)}-+-${'-'.repeat(column_width1)}-+ \n`+
            `| Daily Average (km)     | ${data[1]+' '.repeat(Math.abs(column_width - data[1].length))} | ${data[5]+' '.repeat(Math.abs(column_width1 - data[5].length))} |\n`+
            `+------------------------+-${'-'.repeat(column_width)}-+-${'-'.repeat(column_width1)}-+ \n`+
            `| Avg. Run Distance (km) | ${data[2]+' '.repeat(Math.abs(column_width - data[2].length))} | ${data[6]+' '.repeat(Math.abs(column_width1 - data[6].length))} |\n`+
            `+------------------------+-${'-'.repeat(column_width)}-+-${'-'.repeat(column_width1)}-+ \n`+
            `| Avg. Pace (min/km)     | ${data[3]+' '.repeat(Math.abs(column_width - data[3].length))} | ${data[7]+' '.repeat(Math.abs(column_width1 - data[7].length))} |\n`+
            `+------------------------+-${'-'.repeat(column_width)}-+-${'-'.repeat(column_width1)}-+ \n`+
            '```')
        } else {
            let user = await User.findOne({discord_id : parseInt(interaction.user.id)}, 'statistics days_last_active')
            let user1 = await User.findOne({discord_id : parseInt(interaction.options._hoistedOptions[0].user.id)}, 'statistics days_last_active')
            data[0] = ((user.statistics.map((week) => week.statistics_by_day.filter((day) => day.total_distance != 0).length)).reduce((a, b) => a + b, 0)).toString()
            data[4] = ((user1.statistics.map((week) => week.statistics_by_day.filter((day) => day.total_distance != 0).length)).reduce((a, b) => a + b, 0)).toString()
            data[3] = distances.reduce((a, b) => a + b, 0).toFixed(2).toString()
            data[7] = distances1.reduce((a, b) => a + b, 0).toFixed(2).toString()
            embed = new MessageEmbed()
            .setColor('#FC2525')
            .setDescription(
            '```'+
            `+------------------------+-${'-'.repeat(column_width)}-+-${'-'.repeat(column_width1)}-+ \n`+
            `|                        | ${username + ' '.repeat(Math.abs(column_width - username.length))} | ${username1 + ' '.repeat(Math.abs(column_width1 - username1.length))} |\n`+
            `+------------------------+-${'-'.repeat(column_width)}-+-${'-'.repeat(column_width1)}-+ \n`+
            `| Num. of Runs           | ${data[0]+' '.repeat(Math.abs(column_width - data[0].length))} | ${data[4]+' '.repeat(Math.abs(column_width1 - data[4].length))} |\n`+
            `+------------------------+-${'-'.repeat(column_width)}-+-${'-'.repeat(column_width1)}-+ \n`+
            `| Avg. Mileage/Week (km) | ${data[1]+' '.repeat(Math.abs(column_width - data[1].length))} | ${data[5]+' '.repeat(Math.abs(column_width1 - data[5].length))} |\n`+
            `+------------------------+-${'-'.repeat(column_width)}-+-${'-'.repeat(column_width1)}-+ \n`+
            `| Avg. Pace (min/km)     | ${data[2]+' '.repeat(Math.abs(column_width - data[2].length))} | ${data[6]+' '.repeat(Math.abs(column_width1 - data[6].length))} |\n`+
            `+------------------------+-${'-'.repeat(column_width)}-+-${'-'.repeat(column_width1)}-+ \n`+
            `| Total Distance (km)    | ${data[3]+' '.repeat(Math.abs(column_width - data[3].length))} | ${data[7]+' '.repeat(Math.abs(column_width1 - data[7].length))} |\n`+
            `+------------------------+-${'-'.repeat(column_width)}-+-${'-'.repeat(column_width1)}-+ \n`+
            '```')
        }
    }
    return embed
}