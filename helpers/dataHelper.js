const fetch = require('node-fetch');
const dotenv = require('dotenv');
const Run  = require('../models/Run');
const User  = require('../models/User');
const Guild  = require('../models/Guild');

dotenv.config()

module.exports = {
    getWeeklyData : getWeeklyData,
    getStartOfPeriod : getStartOfPeriod,
    getNumActivePeriods : getNumActivePeriods,
    getMileageData : getMileageData,
    toPace : toPace
}

async function getWeeklyData(guild) {
    const weekly_data = []
    for (const member_id of guild.members) {
        let weekly_distance = 0;
        let weekly_time = 0;
        const user = await User.findOne({discord_id: member_id})
        const runs = (await user.statistics.populate({path: 'runs'})).runs
        const today = new Date()
        for (const run of runs) {
            if (run.date < getStartOfPeriod(new Date()), "week") {
                break
            }
            weekly_distance += run.distance
            weekly_time += run.time
        }
        weekly_data.push({
            username: user.username,
            name: user.name,
            weekly_distance: weekly_distance,
            weekly_time: weekly_time
        })
    }
    weekly_data.sort((data1, data2) =>  useTime ? 
        data2.weekly_time - data1.weekly_time:
        data2.weekly_distance - data1.weekly_distance
    )
    return weekly_data
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
    let times = []
    let distances = []
    let curr_date = getStartOfPeriod(new Date(), time_unit)
    while (index < active_periods) {
        dates.push(curr_date)
        distances.push(0)
        times.push(0)
        while (curr_date.getTime() == getStartOfPeriod(runs[index].date, time_unit).getTime()) {
            if (dates.length > 0 && curr_date.getTime() == dates[dates.length - 1].getTime()) {
                distances[distances.length - 1] += runs[index].distance
                times[times.length - 1] += runs[index].time
            }
            index += 1
        }
        if (index == active_periods) {break}
        curr_date = getStartOfPeriod(curr_date - 1, time_unit)
    }
    // Bug here
    // console.log(distances, dates)
    while (dates.length < (time_unit == "day" ? 7 :4)) {
        curr_date = getStartOfPeriod(curr_date - 1, time_unit)
        dates.push(curr_date)
        distances.push(0)
        times.push(0)
    }
    dates = dates.map((date) => date.getDate() + '/' + 
    (date.getMonth() + 1))
    return {
        dates: dates,
        distances : distances,
        times : times,
    }
}

function getStartOfPeriod(d, time_unit) {
    d = new Date(d);
    d.setUTCHours(0,0,0,0)
    let day = d.getDay()
    let diff = d.getDate()
    if (time_unit == "week") {
        // adjust when day is sunday
        diff = diff - day + (day == 0 ? -6:1);
    }
    return new Date(d.setDate(diff));
}

function toPace(speed) {
    var min = Math.floor(Math.abs(speed));
    var sec = Math.floor((Math.abs(speed) * 60) % 60);
    return min + ":" + (sec < 10 ? "0" : "") + sec;
}