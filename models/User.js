const mongoose = require('mongoose')

var schema = mongoose.Schema({
    'strava_id' : Number,
    'discord_id' : Number,
    'refresh_token' : String,
    'name' : String,
    'username' : String,
    'profile' : String,
    'guilds' : [Number],
    'weekly_stats' : {
        'total_distance' : Number,
        'total_time' : Number,
        'most_recent_recorded_id' : Number,
    }
})
module.exports = mongoose.model("User", schema)