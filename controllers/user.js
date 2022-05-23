const fetch = require('node-fetch');
const dotenv = require('dotenv');
const User  = require('../models/User');
const Guild  = require('../models/Guild');
const Route  = require('../models/Route');

dotenv.config()

const auth_link = "https://www.strava.com/oauth/token"

exports.register = async (req, res) => {
    const code = req.query.code;
    authoriseUser(req.params, code);
    res.send({message: "New user authorised!"});
}

function authoriseUser(discord_data, code) {
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
        .then(async data => {
            console.log('Adding new user...')
            const user = new User({
                'strava_id' : data.athlete.id,
                'discord_id' : discord_data.user_id,
                'refresh_token' : data.refresh_token,
                'name' : `${data.athlete.firstname} ${data.athlete.lastname}`,
                'username' : discord_data.username,
                'profile' : data.athlete.profile,
                'guilds' : [discord_data.guild_id],
                'sex' : data.athlete.sex,
                'region' : data.athlete.city + data.athlete.state + data.athlete.country,
                'created_at' : data.athlete.created_at,
                'joined_at' : new Date(),
                'days_last_active' : -1,
                'most_recent_run' : {
                    'time' : 0,
                    'id': -1,
                    'distance' : -1,
                    'updated_guilds' : []
                },
                'longest_run' : {
                    'date' : 0,
                    'time' : -1,
                    'distance' : -1,
                    'name' : '',
                    'start_latlng' : [],
                    'end_latlng' : [],
                },
                'statistics' : [{
                    'week_starting' : getMonday(new Date()),
                    'total_distance' : 0,
                    'total_time' : 0,
                    'statistics_by_day' : Array(7).fill({
                        'total_distance' : 0, 
                        'total_time' : 0}),
                }],
                'total_distance' : 0,
                'total_time' : 0,
                'total_runs' : 0,
            })
            let guild = await Guild.findOne({guild_id : discord_data.guild_id})
            guild.members.push(user.discord_id)
            await guild.save()
            await user.save()
            console.log('User added!')
            }
        )
}

function getMonday(d) {
    d = new Date(d);
    d.setUTCHours(0,0,0,0)
    var day = d.getDay(),
        diff = d.getDate() - day + (day == 0 ? -6:1); // adjust when day is sunday
    return new Date(d.setDate(diff));
}
