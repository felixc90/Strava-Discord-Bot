const mongoose = require('mongoose')

var schema = mongoose.Schema({
    'name' : String,
    'start_latlng' : [Number],
    'end_latlng' : [Number],
    'date' : Date,
    'time' : Number,
    'distance' : Number
})

module.exports = mongoose.model("Run", schema)