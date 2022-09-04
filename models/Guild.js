const mongoose = require('mongoose')

var schema = mongoose.Schema({
    'guildId' : String,
    'members' : [{
        'id' : String,
        'joinedAt' : Date,
        'totalExp' : Number,
        'modifiers' : [String],
        'mostRecentRunId' : String,
        'logEntries' : [{
            'name' : String,
            'value' : String,
            'inline' : Boolean
        }]
    }],
})

module.exports = mongoose.model("Guild", schema)