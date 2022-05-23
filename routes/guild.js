const express = require('express')
const router  = express.Router();

const guild_controller = require('../controllers/guild');

router.post('/add', guild_controller.add);
router.put('/update', guild_controller.update);

module.exports = router;