const fetch = require('node-fetch');
const dotenv = require('dotenv');
const Run  = require('../models/Run');
const User  = require('../models/User');
const Guild  = require('../models/Guild');

dotenv.config()

module.exports = {
    getStartOfWeek : getStartOfWeek,
    getNumActivePeriods : getNumActivePeriods,
    getRunData : getRunData,
    toPace : toPace
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


async function getRunData(user_id, time_unit, active_periods) {
    const user = await User.findOne({discord_id : user_id})
    const runs = (await user.statistics.populate({path: 'runs'})).runs
    let num_active_periods = await getNumActivePeriods(runs, time_unit)
    console.log(num_active_periods);
    if (active_periods < 0 || active_periods > num_active_periods) {
        active_periods = num_active_periods
    }
    let index = 0
    let dates = []
    let runData = []
    let curr_date = getStartOfPeriod(new Date(), time_unit)
    // Not local time
    while (index < active_periods) {
        dates.push(curr_date)
        runData.push(0)
        console.log(curr_date)
        console.log(getStartOfPeriod(runs[index].date, time_unit))
        while (curr_date.getTime() == getStartOfPeriod(runs[index].date, time_unit).getTime()) {
            if (dates.length > 0 && curr_date.getTime() == dates[dates.length - 1].getTime()) {
                // to be changed
                runData[runData.length - 1] += runs[index].distance
            }
            index += 1
            if (index == active_periods) {
                break
            }
            
        }
        if (index == active_periods) {
            break
        }
        curr_date = getStartOfPeriod(curr_date - 1, time_unit)
    }
    while (dates.length < (time_unit == "day" ? 7 :4)) {
        curr_date = getStartOfPeriod(curr_date - 1, time_unit)
        dates.push(curr_date)
        runData.push(0)
    }
    dates = dates.map((date) => date.getDate() + '/' + 
    (date.getMonth() + 1))
    return {
        dates: dates,
        runData : runData,
    }
}

function getStartOfWeek() {
  d = new Date();
  d.setUTCHours(0,0,0,0)
  let day = d.getDay()
  let diff = d.getDate()
  diff = diff - day + (day == 0 ? -6:1);
  return new Date(d.setDate(diff));
}



function toPace(speed) {
    var min = Math.floor(Math.abs(speed));
    var sec = Math.floor((Math.abs(speed) * 60) % 60);
    return min + ":" + (sec < 10 ? "0" : "") + sec;
}
        