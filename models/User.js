const mongoose = require('mongoose')

var schema = mongoose.Schema({
    'strava_id' : Number,
    'discord_id' : Number,
    'refresh_token' : String,
    'name' : String,
    'username' : String,
    'profile' : String,
    'guilds' : [Number],
    'sex' : String,
    'region' : String,
    'created_at' :Date,
    'joined_at' : Date,
    'days_last_active' : Number,
    'most_recent_run' : {
        'id': Number,
        'time': Date
    },
    'longest_run' : {
        'name' : String,
        'start_latlng' : [Number],
        'end_latlng' : [Number],
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
    'total_runs' : Number,
    'total_distance' : Number,
    'total_time' : Number
})
module.exports = mongoose.model("User", schema)