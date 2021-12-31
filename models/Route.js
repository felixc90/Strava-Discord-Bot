const mongoose = require('mongoose')

var schema = mongoose.Schema({
    'owner' : Number,
    'polylines' : [String],
})

module.exports = mongoose.model("Route", schema)