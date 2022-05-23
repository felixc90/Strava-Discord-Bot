const mongoose = require('mongoose')
const Day = require('./Day').schema;

var schema = mongoose.Schema({
    'week_starting' : Date,
    'total_distance' : Number,
    'total_time' : Number,
    'total_runs' : Number,
    'daily_data' : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Day' }]
})

module.exports = mongoose.model("Week", schema)