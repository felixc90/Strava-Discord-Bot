const fetch = require('node-fetch');
const dotenv = require('dotenv');
const Guild  = require('../models/Guild');
const User  = require('../models/User');

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
                'created_at' :data.athlete.created_at,
                'joined_at' : new Date(),
                'statistics' : {
                    'total_runs' : 0,
                    'total_distance' : 0,
                    'total_time' : 0,
                    'most_recent_run' : "-1",
                    'runs' : []
                },
            })

            let guild = await Guild.findOne({guild_id : discord_data.guild_id})
            if (!guild.members.includes(user.discord_id)) guild.members.push(user.discord_id)
            await guild.save()
            await user.save()
            console.log('User added!')
            }
        )
}