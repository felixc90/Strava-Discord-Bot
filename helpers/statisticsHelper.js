const { MessageAttachment, MessageEmbed } = require('discord.js');
const User  = require('../models/User');
const { getMileageData, toPace, getNumActivePeriods } = require('./dataHelper')

module.exports = {
    getSingleTable : getSingleTable,
    getDoubleTable : getDoubleTable
}

async function getSingleTable(interaction) {
    const user = await User.findOne({discord_id : interaction.user.id})
    const runs = (await user.statistics.populate({path: 'runs'})).runs
    let subcommand = interaction.options._subcommand
    let column_width = user.username.length > 5 ? user.username.length : 5
    let username = user.username
    embed = new MessageEmbed().setColor('#05CBE1')
    single_bar = `+------------------------+-${'-'.repeat(column_width)}-+ \n`
    if (subcommand == 'all-time') {
        num_runs = user.statistics.total_runs.toString()
        distance = parseInt(user.statistics.total_distance).toString()
        time = parseInt(user.statistics.total_time).toString()
        embed.setDescription(
        '```'+
        `${username} Statistics (All-Time)\n` +
        single_bar +
        `|                        | ${table_data(username, column_width)} |\n`+
        single_bar +
        `| Num. of Runs           | ${table_data(num_runs, column_width)} |\n`+
        single_bar +
        `| Total Distance (km     | ${table_data(distance, column_width)} |\n`+
        single_bar +
        `| Total Time (min)       | ${table_data(time, column_width)} |\n`+
        single_bar +
        '```')
    } else {
        let time_distance_data = await getMileageData(runs, subcommand)
        let data = await getData(time_distance_data)
        if (subcommand == 'day') {
            embed.setDescription(
            '```'+
            `${username} Statistics (Last ${time_distance_data.distances.length} Days)\n` +
            single_bar +
            `|                        | ${table_data(username, column_width)} |\n`+
            single_bar +
            `| Num. Active Days       | ${table_data(data.active_periods, column_width)} |\n`+
            single_bar +
            `| Daily Average (km)     | ${table_data(data.period_avg, column_width)} |\n`+
            single_bar +
            `| Avg. Run Distance (km) | ${table_data(data.avg_dist, column_width)} |\n`+
            single_bar +
            `| Avg. Run Time (min)    | ${table_data(data.avg_time, column_width)} |\n`+
            single_bar +
            '```')
        } else if (subcommand == 'week') {
            embed.setDescription(
            '```'+
            `${username} Statistics (Last ${time_distance_data.distances.length} Weeks)\n` +
            single_bar +
            `|                        | ${table_data(username, column_width)} |\n`+
            single_bar +
            `| Num. Active Weeks      | ${table_data(data.active_periods, column_width)} |\n`+
            single_bar +
            `| Weekly Mileage (km)    | ${table_data(data.avg_dist, column_width)} |\n`+
            single_bar +
            `| Weekly Duration (min)  | ${table_data(data.avg_time, column_width)} |\n`+
            single_bar +
            `| Avg. Pace (min/km)     | ${table_data(data.avg_pace, column_width)} |\n`+
            single_bar +
            '```')
        } 

    }

    return embed
}

async function getDoubleTable(interaction) {
    const user1 = await User.findOne({discord_id : interaction.user.id})
    const runs1 = (await user1.statistics.populate({path: 'runs'})).runs
    let subcommand = interaction.options._subcommand
    let column_width1 = user1.username.length > 5 ? user1.username.length : 5
    let username1 = user1.username
    
    user2 = await User.findOne({discord_id : interaction.options._hoistedOptions[0].user.id})
    if (user2 == null) return interaction.options._hoistedOptions[0].user.username
    const runs2 = (await user2.statistics.populate({path: 'runs'})).runs
    let column_width2 = user2.username.length > 5 ? user2.username.length : 5
    let username2 = user2.username
    
    embed = new MessageEmbed().setColor('#05CBE1')
    double_bar = `+------------------------+-${'-'.repeat(column_width1)}-+-${'-'.repeat(column_width2)}-+ \n`
    if (subcommand == 'all-time') {
        num_runs1 = user1.statistics.total_runs.toString()
        distance1 = parseInt(user1.statistics.total_distance).toString()
        time1 = parseInt(user1.statistics.total_time).toString()
        num_runs2 = user2.statistics.total_runs.toString()
        distance2 = parseInt(user2.statistics.total_distance).toString()
        time2 = parseInt(user2.statistics.total_time).toString()


        embed.setDescription(
        '```'+
        `${username1} v ${username2} Statistics (All-Time)\n` +
        double_bar +
        `|                        | ${table_data(username1, column_width1)} | ${table_data(username2, column_width2)} |\n`+
        double_bar +
        `| Num. of Runs           | ${table_data(num_runs1, column_width1)} | ${table_data(num_runs2, column_width2)} |\n`+
        double_bar +
        `| Total Distance (km)    | ${table_data(distance1, column_width1)} | ${table_data(distance2, column_width2)} |\n`+
        double_bar +
        `| Total Time (min)       | ${table_data(time1, column_width1)} | ${table_data(time2, column_width2)} |\n`+
        double_bar +
        '```')
    } else {
        let time_distance_data1 = await getMileageData(runs1, subcommand)
        let time_distance_data2 = await getMileageData(runs2, subcommand)
        min_length = Math.min(time_distance_data1.dates.length, time_distance_data2.dates.length)
        time_distance_data1 = {
            distances: time_distance_data1.distances.slice(0, min_length),
            dates: time_distance_data1.dates.slice(0, min_length),
            times: time_distance_data1.times.slice(0, min_length)
        }
        time_distance_data2 = {
            distances: time_distance_data2.distances.slice(0, min_length),
            dates: time_distance_data2.dates.slice(0, min_length),
            times: time_distance_data1.times.slice(0, min_length)
        }

        data1 = await getData(time_distance_data1)
        data2 = await getData(time_distance_data2)
        if (subcommand == 'day') {
            console.log(data1.active_periods)
            embed.setDescription(
            '```'+
            `${username1} v ${username2} Statistics (Last ${min_length} Days)\n` +
            double_bar +
            `|                        | ${table_data(username1, column_width1)} | ${table_data(username2, column_width2)} |\n`+
            double_bar +
            `| Num. Days Ran          | ${table_data(data1.active_periods, column_width1)} | ${table_data(data2.active_periods, column_width2)} |\n`+
            double_bar +
            `| Daily Average (km)     | ${table_data(data1.period_avg, column_width1)} | ${table_data(data2.period_avg, column_width2)} |\n`+
            double_bar +
            `| Avg. Run Distance (km) | ${table_data(data1.avg_dist, column_width1)} | ${table_data(data2.avg_dist, column_width2)} |\n`+
            double_bar +
            `| Avg. Run Time (min)    | ${table_data(data1.avg_time, column_width1)} | ${table_data(data2.avg_time, column_width2)} |\n`+
            double_bar +
            '```')
        } else if (subcommand == 'week')  {
            embed.setDescription(
            '```'+
            `${username1} v ${username2} Statistics (Last ${min_length} Weeks)\n` +
            double_bar +
            `|                        | ${table_data(username1, column_width1)} | ${table_data(username2, column_width2)} |\n`+
            double_bar +
            `| Num. Active Weeks      | ${table_data(data1.active_periods, column_width1)} | ${table_data(data1.active_periods, column_width2)} |\n`+
            double_bar +
            `| Weekly Mileage (km)    | ${table_data(data1.avg_dist, column_width1)} | ${table_data(data1.avg_dist, column_width2)} |\n`+
            double_bar +
            `| Weekly Duration (min)  | ${table_data(data1.avg_time, column_width1)} | ${table_data(data1.avg_time, column_width2)} |\n`+
            double_bar +
            `| Avg. Pace (min/km)     | ${table_data(data1.avg_pace, column_width1)} | ${table_data(data1.avg_pace, column_width2)} |\n`+
            double_bar +
            '```')
        }
    }
    return embed
}

async function getData(time_distance_data) {
    let distances = time_distance_data.distances
    let times = time_distance_data.times
    active_periods = distances.filter((run)=> run != 0).length.toString(),
    period_avg = (distances.reduce((a, b) => a + b, 0) / distances.length).toFixed(2).toString(),
    avg_dist = distances.filter((run)=> run != 0).length == 0 ? '0' :(distances.reduce((a, b) => a + b, 0) 
                / distances.filter((run)=> run != 0).length).toFixed(2).toString(),
    avg_time = times.filter((run)=> run != 0).length == 0 ? '0' :(times.reduce((a, b) => a + b, 0) 
                / times.filter((run)=> run != 0).length).toString(),
    avg_pace = toPace(times.reduce((a, b) => a + b, 0)/(distances.reduce((a, b) => a + b, 0)))

    return  {
        active_periods : active_periods,
        period_avg : period_avg,
        avg_dist : avg_dist,
        avg_time : avg_time,
        avg_pace : avg_pace,
    }
}

function table_data(string, column_width) {
    return string + ' '.repeat(Math.abs(column_width - string.length))
}