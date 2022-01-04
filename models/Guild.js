const mongoose = require('mongoose')

var schema = mongoose.Schema({
    'guild_id' : Number,
    'members' : [Number],
})

module.exports = mongoose.model("Guild", schema)