const mongoose = require('mongoose')

var schema = mongoose.Schema({
    'id' : Number,
    'name' : String,
    'refresh_token' : String,
    'username' : String,
    'profile' : String,
    'weekly_stats' : {
        'total_distance' : Number,
        'total_time' : Number,
        'most_recent_recorded_id' : Number,
    }
})
module.exports = mongoose.model("User", schema)