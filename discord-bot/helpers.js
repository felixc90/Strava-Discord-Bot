const fetch = require('node-fetch');


async function getUserRuns(discord_id) {
    return await fetch(`${process.env.URL}user/runs/${discord_id}`, {
        method: 'get',
        headers: {'Content-Type': 'application/json'}
    }).then(res => res.json())
}

async function getGuildMembers(guild_id) {
    console.log(guild_id)
    return await fetch(`${process.env.URL}guild/members/${guild_id}`, {
        method: 'get',
        headers: {'Content-Type': 'application/json'}
    }).then(res => res.json())
}

async function getWeeklyRuns(guild_id) {
    const guild_members = await getGuildMembers(guild_id)
    for (const member of guild_members) {
        let weekly_time = 0;
        let weekly_distance = 0;
        const user_runs = await getUserRuns(member);
        for (const run of user_runs) {
        }
    }
}

module.exports = {
    getUserRuns: getUserRuns,
    getGuildMembers: getGuildMembers
}

async function getData(statistics, subcommand, num) {
    let dates = []
    let distances = []
    let times = []
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

function toPace(speed) {
    return `${parseInt(speed)}:${parseInt((speed - parseInt(speed)) * 60)}`
}

module.exports = {
    getData: getData,
    toPace: toPace
}