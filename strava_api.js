const fetch = require('node-fetch');
const dotenv = require('dotenv');
const fs = require('fs');
const DATA = require('./server')

dotenv.config()

function addUser(req, res, next) {
    const code = req.url.split('&')[1].substring(5);
    authoriseUser(code);
    res.json({message: "New user added!"});
};

const auth_link = "https://www.strava.com/oauth/token"

function authoriseUser(code){
    fetch(auth_link,{
        method: 'post',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            client_id: '71610',
            client_secret: process.env.STRAVA_CLIENT_SECRET,
            code: code,
            grant_type: 'authorization_code'
        })
    }).then(res => res.json())
        .then(data => {
            // console.log(DATA.store)
            const userIds = DATA.store.users.map(user => user.id)
            if (userIds.includes(data.athlete.id)) {
                return;
            }
            DATA.store.users.push(
            {
                'id' : data.athlete.id,
                'refresh_token' : data.refresh_token,
                'name' : `${data.athlete.firstname} ${data.athlete.lastname}`,
                'profile' : data.athlete.profile,
                'username' : data.athlete.username,
                'weekly_stats' : {
                    'total_distance' : 0,
                    'total_time' : 0,
                    'most_recent_recorded_id' : -1,
                }
            })
            fetch('http://localhost:3000/update-leaderboard', {
                method: 'get'
            })
            console.log(DATA.store)
            }
        )
}


function updateLeaderboard(req, res, next) {
    console.log('Updating leaderboard...')
    for (let user = 0; user < DATA.store.users.length; user++) {
        reAuthorize(user)
    }
    res.json({message: "Leaderboard updated!"});
};

function reAuthorize(user) {
    fetch(auth_link, {
        method: 'post',

        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            client_id: '71610',
            client_secret: process.env.STRAVA_CLIENT_SECRET,
            refresh_token: DATA.store.users[user].refresh_token,
            grant_type: 'refresh_token'
        })

    }).then(res => res.json())
        .then(res => getActivities(res, user))
}

function getActivities(res, user) {
    const activities_link = `https://www.strava.com/api/v3/athlete/activities?access_token=${res.access_token}`
    fetch(activities_link)
        .then((res) => res.json())
        .then((data) => 
        {
            // computing the date reference for start of week
            const date = new Date()
            date.setDate(date.getDate() - date.getDay() + 1)
            const start_of_week = new Date(date.toDateString())
            // If new week, reset all statistics
            if (start_of_week != DATA.store.week) {
                DATA.store.users[user].weekly_stats = {
                    'total_distance' : 0,
                    'total_time' : 0,
                    'most_recent_recorded_id' : -1,
                }
                DATA.store.week = start_of_week
            }
            console.log(`Computing statistics for week starting ${DATA.store.week}`)
            for (let run = 0; run < data.length; run++) {
                const date_of_run = new Date(data[run].start_date_local)
                // Do not update user stats if run is in a previous week or
                // if we have reached a previously updated run
                if (date_of_run < start_of_week || data[run].id ===
                    DATA.store.users[user].weekly_stats.most_recent_recorded_id) {
                    break;
                }
                DATA.store.users[user].weekly_stats.most_recent_recorded_id = data[run].id
                DATA.store.users[user].weekly_stats.total_distance += data[run].distance / 1000
                DATA.store.users[user].weekly_stats.total_time += data[run].moving_time / 60
                if (data[run].map.summary_polyline != null &&
                    !DATA.store.routes.includes(data[run].map.summary_polyline)) {
                    DATA.store.routes.push(data[run].map.summary_polyline)
                }
            }
            console.log(DATA.store.users[user].weekly_stats)
            let json = JSON.stringify(DATA.store, null, 2);
            fs.writeFile('database.json', json, () => {});
        })
}

module.exports = {
    addUser: addUser,
    updateLeaderboard: updateLeaderboard,
};