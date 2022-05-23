const express = require('express')
const router  = express.Router();

const user_controller = require('../controllers/user');

router.get("/register/:guild_id/:user_id/:username", user_controller.register);

module.exports = router