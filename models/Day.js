const mongoose = require('mongoose')
const Run = require('./Run').schema;

var schema = mongoose.Schema({
    'week_starting' : Date,
    'total_distance' : Number,
    'total_time' : Number,
    'total_runs' : Number,
    'run_data' : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Run' }]
})

module.exports = mongoose.model("Day", schema)