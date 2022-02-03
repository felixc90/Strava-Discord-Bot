const { SlashCommandBuilder } = require('@discordjs/builders');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const { MessageAttachment, MessageEmbed } = require('discord.js');
const { toPace, getData } = require('../helpers.js')
const {registerFont} = require("canvas")
const User = require('../models/User')

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
        let embed = await getEmbed(interaction)
        if (typeof embed === 'string') {
            embed = new MessageEmbed()
            .setColor('#05CBE1')
            .setDescription('❗️**' + graph + '** is not registered❗️\n\n Use `/register` to add to the database. ✨')
        }
        await interaction.reply({embeds : [embed]})
    }
};

async function getEmbed(interaction) {
    let user = await User.findOne({discord_id : parseInt(interaction.user.id)})
    if (user == null) return interaction.user.username
    let subcommand = interaction.options._subcommand
    let num = subcommand == 'day' ? user.days_last_active : user.statistics.length + 1
    let column_width = user.username.length > 5 ? user.username.length : 5
    let username = user.username
    var user1, distances1, times1, column_width1, username1
    if (interaction.options._hoistedOptions.length != 0) {
        user1 = await User.findOne({discord_id : parseInt(interaction.options._hoistedOptions[0].user.id)})
        if (user1 == null) return interaction.options._hoistedOptions[0].user.username
        if (user1.days_last_active > user.days_last_active && subcommand == 'day') num = user1.days_last_active
        if (user1.statistics.length > user.statistics.length && subcommand == 'week') num = user1.statistics.length + 1
        column_width1 = user1.username.length > 5 ? user1.username.length : 5
        let data1 = await getData(user1.statistics, subcommand, num)
        distances1 = data1[1], times1 = data1[2], username1 = user1.username
    }
    let data = await getData(user.statistics, subcommand, num)
    distances = data[1], times = data[2]
    data = [
        distances.filter((run)=> run != 0).length.toString(),
        (distances.reduce((a, b) => a + b, 0) / distances.length).toFixed(2).toString(),
        distances.filter((run)=> run != 0).length == 0 ? '0' :(distances.reduce((a, b) => a + b, 0) / distances.filter((run)=> run != 0).length).toFixed(2).toString(),
        times.filter((run)=> run != 0).length == 0 ? '0' :(times.reduce((a, b) => a + b, 0) / times.filter((run)=> run != 0).length).toFixed(2).toString()]
    embed = new MessageEmbed().setColor(interaction.options._hoistedOptions.length != 0 ? '#FC2525' : '#05CBE1')
    if (interaction.options._hoistedOptions.length == 0) {
        if (subcommand == 'day') {
            embed.setDescription(
            '```'+
            `${username} Statistics (Last ${num} Days)\n` +
            `+------------------------+-${'-'.repeat(column_width)}-+ \n`+
            `|                        | ${username + ' '.repeat(Math.abs(column_width - username.length))} |\n`+
            `+------------------------+-${'-'.repeat(column_width)}-+ \n`+
            `| Num. Active Days       | ${data[0]+' '.repeat(Math.abs(column_width - data[0].length))} |\n`+
            `+------------------------+-${'-'.repeat(column_width)}-+ \n`+
            `| Daily Average (km)     | ${data[1]+' '.repeat(Math.abs(column_width - data[1].length))} |\n`+
            `+------------------------+-${'-'.repeat(column_width)}-+ \n`+
            `| Avg. Run Distance (km) | ${data[2]+' '.repeat(Math.abs(column_width - data[2].length))} |\n`+
            `+------------------------+-${'-'.repeat(column_width)}-+ \n`+
            `| Avg. Run Time (min)    | ${data[3]+' '.repeat(Math.abs(column_width - data[3].length))} |\n`+
            `+------------------------+-${'-'.repeat(column_width)}-+ \n`+
            '```')
        } else if (subcommand == 'week') {
            data[2] = toPace(times.reduce((a, b) => a + b, 0)/(distances.reduce((a, b) => a + b, 0)))
            embed.setDescription(
            '```'+
            `${username} Statistics (Last ${num} Weeks)\n` +
            `+------------------------+-${'-'.repeat(column_width)}-+ \n`+
            `|                        | ${username + ' '.repeat(Math.abs(column_width - username.length))} |\n`+
            `+------------------------+-${'-'.repeat(column_width)}-+ \n`+
            `| Num. Active Weeks      | ${data[0]+' '.repeat(Math.abs(column_width - data[0].length))} |\n`+
            `+------------------------+-${'-'.repeat(column_width)}-+ \n`+
            `| Weekly Mileage (km)    | ${data[1]+' '.repeat(Math.abs(column_width - data[1].length))} |\n`+
            `+------------------------+-${'-'.repeat(column_width)}-+ \n`+
            `| Weekly Duration (min)  | ${data[3]+' '.repeat(Math.abs(column_width - data[3].length))} |\n`+
            `+------------------------+-${'-'.repeat(column_width)}-+ \n`+
            `| Avg. Pace (min/km)     | ${data[2]+' '.repeat(Math.abs(column_width - data[2].length))} |\n`+
            `+------------------------+-${'-'.repeat(column_width)}-+ \n`+
            '```')
        } else {
            console.log(user)
            data[0] = user.total_runs.toString()
            data[1] = parseInt(user.total_distance).toString()
            data[2] = parseInt(user.total_time).toString()
            embed.setDescription(
            '```'+
            `${username} Statistics (All-Time)\n` +
            `+------------------------+-${'-'.repeat(column_width)}-+ \n`+
            `|                        | ${username + ' '.repeat(Math.abs(column_width - username.length))} |\n`+
            `+------------------------+-${'-'.repeat(column_width)}-+ \n`+
            `| Num. of Runs           | ${data[0]+' '.repeat(Math.abs(column_width - data[0].length))} |\n`+
            `+------------------------+-${'-'.repeat(column_width)}-+ \n`+
            `| Total Distance (km     | ${data[1]+' '.repeat(Math.abs(column_width - data[1].length))} |\n`+
            `+------------------------+-${'-'.repeat(column_width)}-+ \n`+
            `| Total Time (min)       | ${data[2]+' '.repeat(Math.abs(column_width - data[2].length))} |\n`+
            `+------------------------+-${'-'.repeat(column_width)}-+ \n`+
            '```')
        }
    } else {
        data.push(distances1.filter((run)=> run != 0).length.toString())
        data.push((distances1.reduce((a, b) => a + b, 0) / distances1.length).toFixed(2).toString()),
        data.push(distances1.filter((run)=> run != 0).length == 0 ? '0' :(distances1.reduce((a, b) => a + b, 0) / distances1.filter((run)=> run != 0).length).toFixed(2).toString())
        data.push(times1.filter((run)=> run != 0).length == 0 ? '0' :(times1.reduce((a, b) => a + b, 0) / times1.filter((run)=> run != 0).length).toFixed(2).toString())
        if (subcommand == 'day') {
            embed.setDescription(
            '```'+
            `${username} v ${username1} Statistics (Last ${num} Days)` +
            `+------------------------+-${'-'.repeat(column_width)}-+-${'-'.repeat(column_width1)}-+ \n`+
            `|                        | ${username + ' '.repeat(Math.abs(column_width - username.length))} | ${username1 + ' '.repeat(Math.abs(column_width1 - username1.length))} |\n`+
            `+------------------------+-${'-'.repeat(column_width)}-+-${'-'.repeat(column_width1)}-+ \n`+
            `| Num. Days Ran          | ${data[0]+' '.repeat(Math.abs(column_width - data[0].length))} | ${data[4]+' '.repeat(Math.abs(column_width1 - data[4].length))} |\n`+
            `+------------------------+-${'-'.repeat(column_width)}-+-${'-'.repeat(column_width1)}-+ \n`+
            `| Daily Average (km)     | ${data[1]+' '.repeat(Math.abs(column_width - data[1].length))} | ${data[5]+' '.repeat(Math.abs(column_width1 - data[5].length))} |\n`+
            `+------------------------+-${'-'.repeat(column_width)}-+-${'-'.repeat(column_width1)}-+ \n`+
            `| Avg. Run Distance (km) | ${data[2]+' '.repeat(Math.abs(column_width - data[2].length))} | ${data[6]+' '.repeat(Math.abs(column_width1 - data[6].length))} |\n`+
            `+------------------------+-${'-'.repeat(column_width)}-+-${'-'.repeat(column_width1)}-+ \n`+
            `| Avg. Run Time (min)    | ${data[3]+' '.repeat(Math.abs(column_width - data[3].length))} | ${data[7]+' '.repeat(Math.abs(column_width1 - data[7].length))} |\n`+
            `+------------------------+-${'-'.repeat(column_width)}-+-${'-'.repeat(column_width1)}-+ \n`+
            '```')
        } else if (subcommand == 'week')  {
            data[2] = toPace(times.reduce((a, b) => a + b, 0)/(distances.reduce((a, b) => a + b, 0)))
            data[6] = toPace(times1.reduce((a, b) => a + b, 0)/(distances1.reduce((a, b) => a + b, 0)))
            embed.setDescription(
            '```'+
            `${username} v ${username1} Statistics (Last ${num} Weeks)` +
            `+------------------------+-${'-'.repeat(column_width)}-+-${'-'.repeat(column_width1)}-+ \n`+
            `|                        | ${username + ' '.repeat(Math.abs(column_width - username.length))} | ${username1 + ' '.repeat(Math.abs(column_width1 - username1.length))} |\n`+
            `+------------------------+-${'-'.repeat(column_width)}-+-${'-'.repeat(column_width1)}-+ \n`+
            `| Num. Active Weeks      | ${data[0]+' '.repeat(Math.abs(column_width - data[0].length))} | ${data[4]+' '.repeat(Math.abs(column_width1 - data[4].length))} |\n`+
            `+------------------------+-${'-'.repeat(column_width)}-+-${'-'.repeat(column_width1)}-+ \n`+
            `| Weekly Mileage (km)    | ${data[1]+' '.repeat(Math.abs(column_width - data[1].length))} | ${data[5]+' '.repeat(Math.abs(column_width1 - data[5].length))} |\n`+
            `+------------------------+-${'-'.repeat(column_width)}-+-${'-'.repeat(column_width1)}-+ \n`+
            `| Weekly Duration (min)  | ${data[3]+' '.repeat(Math.abs(column_width - data[3].length))} | ${data[6]+' '.repeat(Math.abs(column_width1 - data[6].length))} |\n`+
            `+------------------------+-${'-'.repeat(column_width)}-+-${'-'.repeat(column_width1)}-+ \n`+
            `| Avg. Pace (min/km)     | ${data[2]+' '.repeat(Math.abs(column_width - data[2].length))} | ${data[7]+' '.repeat(Math.abs(column_width1 - data[7].length))} |\n`+
            `+------------------------+-${'-'.repeat(column_width)}-+-${'-'.repeat(column_width1)}-+ \n`+
            '```')
        } else {
            data[0] = user.total_runs.toString()
            data[1] = parseInt(user.total_distance).toString()
            data[2] = parseInt(user.total_time).toString()
            data[3] = user1.total_runs.toString()
            data[4] = parseInt(user1.total_distance).toString()
            data[5] = parseInt(user1.total_time).toString()
            embed.setDescription(
            `${username} v ${username1} Statistics (All-Time)` +
            `+------------------------+-${'-'.repeat(column_width)}-+-${'-'.repeat(column_width1)}-+ \n`+
            `|                        | ${username + ' '.repeat(Math.abs(column_width - username.length))} | ${username1 + ' '.repeat(Math.abs(column_width1 - username1.length))} |\n`+
            `+------------------------+-${'-'.repeat(column_width)}-+-${'-'.repeat(column_width1)}-+ \n`+
            `| Num. of Runs           | ${data[0]+' '.repeat(Math.abs(column_width - data[0].length))} | ${data[3]+' '.repeat(Math.abs(column_width1 - data[3].length))} |\n`+
            `+------------------------+-${'-'.repeat(column_width)}-+-${'-'.repeat(column_width1)}-+ \n`+
            `| Total Distance (km)    | ${data[1]+' '.repeat(Math.abs(column_width - data[1].length))} | ${data[4]+' '.repeat(Math.abs(column_width1 - data[4].length))} |\n`+
            `+------------------------+-${'-'.repeat(column_width)}-+-${'-'.repeat(column_width1)}-+ \n`+
            `| Total Time (min)       | ${data[2]+' '.repeat(Math.abs(column_width - data[2].length))} | ${data[5]+' '.repeat(Math.abs(column_width1 - data[5].length))} |\n`+
            `+------------------------+-${'-'.repeat(column_width)}-+-${'-'.repeat(column_width1)}-+ \n`+
            '```')
        }
    }
    return embed
}