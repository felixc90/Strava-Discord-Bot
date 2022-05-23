const mongoose = require('mongoose')
const Run  = require('./Run');
const Week  = require('./Week');

var schema = mongoose.Schema({
    'strava_id' : String,
    'discord_id' : String,
    'refresh_token' : String,
    'name' : String,
    'username' : String,
    'profile' : String,
    'guilds' : [Number],
    'sex' : String,
    'region' : String,
    'created_at' :Date,
    'joined_at' : Date,
    'statistics' : {
        'total_runs' : Number,
        'total_distance' : Number,
        'total_time' : Number,
        'days_last_active' : Number,
        'most_recent_run' : Run,
        'longest_run' : Run,
        'run_data' : [Week]
    },
    
})
module.exports = mongoose.model("User", schema)