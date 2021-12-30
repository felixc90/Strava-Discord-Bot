const express = require('express')
const fs = require('fs');
const {addUser, updateLeaderboard, initMessage} = require('./strava_api.js')

const router  = express.Router(); 

// routes
router.get('/new-user', addUser); 
router.get('/update-leaderboard', updateLeaderboard); 
router.get('/', initMessage); 

const app = express();

app.use(express.json());

app.use('/', router); // to use the routes

const DATA = {
    'users' : [],
    'routes' : [],
    'week' : -1,
}

async function readFile(path) {
    return new Promise((resolve, reject) => {
      fs.readFile(path, 'utf8', function (err, data) {
        if (err) {
          reject(err);
        }
        resolve(JSON.parse(data.toString()));
      });
    });
  }
async function readData() {
    let data = await readFile("./database.json");
    module.exports.store = data
}

const listener = app.listen(process.env.PORT || 3000, () => {
    if (fs.existsSync('./database.json')) {
        readData()
    } else {
        let json = JSON.stringify(DATA, null, 2);
        fs.writeFile('database.json', json, () => {});
        module.exports.store = DATA
    }
    console.log('Your app is listening on port ' + listener.address().port)
})
