const express = require('express')
const { authoriseUser, reAuthorize, addGuild } = require('./strava_api')
const User = require('./models/User');
const Route = require('./models/Route');
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
    const users = await User.find({}, 'id name refresh_token username profile weekly_stats')
    res.send({listUsers: users});
});

router.get('/routes', async (req, res) => {
    const routes = await Route.find()
    res.send({'routes' : routes});
});

router.put('/update-users', async (req, res) => {
    console.log('Updating leaderboard...')
    // console.log(req.body.guild_id)
    const guild = await Guild.find({guild_id: req.body.guild_id})
    const users = await User.find({discord_id : { $in: guild[0].members } })
    // console.log(users)
    for (let i = 0; i < users.length; i++) {
        reAuthorize(users[i])
    }
    res.send({message: "Leaderboard updated!"});
}); 

router.get('/clear', async (req, res) => {
    await User.deleteMany()
    await Route.deleteMany()
    res.send({message: "Cleared database!"});
});


module.exports = router