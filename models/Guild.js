const mongoose = require('mongoose')

var schema = mongoose.Schema({
    'guild_id' : String,
    'members' : [String],
    'use_time' : Boolean,
    'page_num' : Number,
})

module.exports = mongoose.model("Guild", schema)