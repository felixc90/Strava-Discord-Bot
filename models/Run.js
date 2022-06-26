const mongoose = require('mongoose')

var schema = mongoose.Schema({
    'id' : String,
    'name' : String,
    'start_latlng' : [Number],
    'end_latlng' : [Number],
    'date' : Date,
    'time' : Number,
    'distance' : Number,
    'summary_polyline' : String,
})

module.exports = mongoose.model("Run", schema)