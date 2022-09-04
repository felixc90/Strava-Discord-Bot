const mongoose = require('mongoose')

var schema = mongoose.Schema({
    'guildId' : String,
    'members' : [String],
    'pageNumber' : Number,
})

module.exports = mongoose.model("Guild", schema)