const mongoose = require('mongoose')

var schema = mongoose.Schema({
    'routes' : [String]
})

module.exports = mongoose.model("Route", schema)