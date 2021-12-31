const express = require('express')
const { authoriseUser, reAuthorize } = require('./strava_api')
const User = require('./models/User');
const Time = require('./models/Time');
const Route = require('./models/Route');
const router  = express.Router(); 

router.get('/', (req, res) => {
    res.json({message: "It worked!"});
});

router.get('/add-user', (req, res) => {
    const code = req.url.split('&')[1].substring(5);
    authoriseUser(code);
    res.send({message: "New user added!"});
});

router.get('/users', async (req, res) => {
    const users = await User.find({}, 'id name refresh_token username profile weekly_stats')
    res.send({listUsers: users});
});

router.get('/update-users', async (req, res) => {
    console.log('Updating leaderboard...')
    const users = await User.find({})
    for (let i = 0; i < users.length; i++) {
        reAuthorize(users[i])
    }
    res.send({message: "Leaderboard updated!"});
}); 

router.get('/clear', async (req, res) => {
    await User.deleteMany()
    await Route.deleteMany()
    await Time.deleteMany()
    res.send({message: "Cleared database!"});
});


module.exports = router