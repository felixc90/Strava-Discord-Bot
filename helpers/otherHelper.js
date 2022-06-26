const fetch = require('node-fetch');
const dotenv = require('dotenv');
const Run  = require('../models/Run');
const User  = require('../models/User');
const Guild  = require('../models/Guild');

dotenv.config()

module.exports = {
    getWeeklyData : getWeeklyData
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
            if (run.date < getStartOfWeek(new Date())) {
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

function getStartOfWeek(d) {
    d = new Date(d);
    d.setUTCHours(0,0,0,0)
    var day = d.getDay(),
        diff = d.getDate() - day + (day == 0 ? -6:1); // adjust when day is sunday
    return new Date(d.setDate(diff));
}