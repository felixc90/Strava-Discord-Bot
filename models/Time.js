const mongoose = require('mongoose')

var schema = mongoose.Schema({
    'week' : String,
})

module.exports = mongoose.model("Time", schema)