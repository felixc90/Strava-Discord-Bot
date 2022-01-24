const mongoose = require('mongoose')

var schema = mongoose.Schema({
    'strava_id' : Number,
    'discord_id' : Number,
    'refresh_token' : String,
    'name' : String,
    'username' : String,
    'profile' : String,
    'guilds' : [Number],
    'most_recent_run' : Number,
    'routes' : [String],
    'total_distance' : Number,
    'total_time' : Number,
    'longest_run' : {
        'date' : Date,
        'time' : Number,
        'distance' : Number
    },
    'statistics' : [
        {
            'week_starting' : Date,
            'total_distance' : Number,
            'total_time' : Number,
            'statistics_by_day' : [{
                'total_distance' : Number,
                'total_time' : Number,
            }],
            
        }
    ],
    'days_last_active' : Number
})
module.exports = mongoose.model("User", schema)