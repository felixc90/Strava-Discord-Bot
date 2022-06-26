const mongoose = require('mongoose')
const Run  = require('./Run').schema;

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
        'most_recent_run' : String,
        'runs' : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Run' }]
    },
    
})
module.exports = mongoose.model("User", schema)