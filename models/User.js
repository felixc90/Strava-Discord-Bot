const mongoose = require('mongoose')
const Run  = require('./Run').schema;

var schema = mongoose.Schema({
  'stravaId' : String,
  'discordId' : String,
  'refreshToken' : String,
  'name' : String,
  'username' : String,
  'profile' : String,
  'totalRuns' : Number,
  'totalDistance' : Number,
  'totalTime' : Number,
  'lastUpdated' : Date,
  'runs' : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Run' }]
})
module.exports = mongoose.model("User", schema)