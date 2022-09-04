const mongoose = require('mongoose')
const Run  = require('./Run').schema;

var schema = mongoose.Schema({
    'stravaId' : String,
    'discordId' : String,
    'refreshToken' : String,
    'name' : String,
    'username' : String,
    'profile' : String,
    'statistics' : {
        'totalRuns' : Number,
        'totalDistance' : Number,
        'totalTime' : Number,
        'most_recent_run' : String,
        'runs' : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Run' }]
    },
    
})
module.exports = mongoose.model("User", schema)