const express = require('express')
const fs = require('fs');
const {addUser, updateLeaderboard} = require('./strava_api.js')

const router  = express.Router(); 

// routes
router.get('/new-user', addUser); 
router.get('/update-leaderboard', updateLeaderboard); 

const app = express();

app.use(express.json());

app.use('/', router); // to use the routes

const listener = app.listen(process.env.PORT || 3000, () => {
    console.log('Your app is listening on port ' + listener.address().port)
})
