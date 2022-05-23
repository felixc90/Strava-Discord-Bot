const mongoose = require('mongoose')
const Run  = require('./Run').schema;
const Week  = require('./Week').schema;

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
        'most_recent_run' : { type: mongoose.Schema.Types.ObjectId, ref: 'Run' },
        'longest_run' : { type: mongoose.Schema.Types.ObjectId, ref: 'Run' },
        'weekly_data' : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Week' }]
    },
    
})
module.exports = mongoose.model("User", schema)