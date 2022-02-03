const express = require('express')
const { authoriseUser, reAuthorize, addGuild } = require('./strava_api')
const User = require('./models/User');
const Guild = require('./models/Guild');
const router  = express.Router(); 

router.get('/', (req, res) => {
    res.json({message: "It worked!"});
});

router.get('/add-user/:guild_id/:user_id/:username', async (req, res) => {
    const code = req.query.code;
    authoriseUser(req.params, code);
    res.send({message: "New user added!"});
});

router.post('/add-guild', (req, res) => {
    const guild_id = req.body.guild_id;
    console.log(guild_id)
    addGuild(guild_id);
    res.send({message: "New guild added!"});
});

router.get('/users', async (req, res) => {
    const users = await User.find({}, 'discord_id strava_id name username refresh_token profile')
    res.send({listUsers: users.routes});
});

router.get('/routes/:user_id', async (req, res) => {
    const user = await User.findOne({discord_id: req.params.user_id}, 'routes')
    res.send({'routes' : user.routes});
});

router.put('/update-users', async (req, res) => {
    console.log('Updating leaderboard...')
    const guild = await Guild.findOne({guild_id: req.body.guild_id})
    const users = await User.find({discord_id : { $in: guild.members } })
    for (let i = 0; i < users.length; i++) {
        reAuthorize(users[i])
    }
    res.send({message: "Leaderboard updated!"});
}); 

router.get('/clear', async (req, res) => {
    await User.deleteMany()
    await Guild.deleteMany()
    res.send({message: "Cleared database!"});
});


module.exports = router