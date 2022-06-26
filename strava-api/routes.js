const express = require('express')
const router  = express.Router();

const controller = require('./controller.js');

router.get("/register/:guild_id/:user_id/:username", controller.register);

module.exports = router