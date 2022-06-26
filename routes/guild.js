const express = require('express')
const router  = express.Router();

const guild_controller = require('../controllers/guild');

router.post('/add', guild_controller.add);
router.put('/update', guild_controller.update);
router.get('/weeklydata/:guild_id', guild_controller.weeklydata);

module.exports = router;