const fetch = require('node-fetch');
const dotenv = require('dotenv');
const Guild  = require('../models/Guild');
const User  = require('../models/User');

dotenv.config()

const authLink = "https://www.strava.com/oauth/token"

exports.register = async (req, res) => {
    const code = req.query.code;
    authoriseUser(req.params, code);
    res.send({message: "New user authorised!"});
}

function authoriseUser(params, code) {
    fetch(authLink, {
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
                'stravaId' : data.athlete.id,
                'discordId' : params.userId,
                'refreshToken' : data.refresh_token,
                'name' : `${data.athlete.firstname} ${data.athlete.lastname}`,
                'username' : params.username,
                'profile' : data.athlete.profile,
                'totalRuns' : 0,
                'totalDistance' : 0,
                'totalTime' : 0,
                'runs' : []
            })

            let guild = await Guild.findOne({guildId : params.guildId})
            if (!guild.members.map(member => member.id).includes(interaction.user.id)) 
            guild.members.push({
                'id' : user.discordId,
                'joinedAt' : new Date(),
                'totalExp' : 0,
                'modifiers' : [],
                'mostRecentRunId' : -1,
                'logEntries' : []
            })
            await guild.save()
            await user.save()
            console.log('User added to Achilles!')
            }
        )
}