const fetch = require('node-fetch');
const dotenv = require('dotenv');

const Guild = require('../models/Guild')
const User = require('../models/User')

dotenv.config()

module.exports = {
	name: 'guildDelete',
	once: true,
	async execute(client, guild) {
    if (await Guild.deleteOne({guildId: guild.id}) != 1) {
        console.log("Error occurred");
        return;
    }
    console.log(`Removed guild: ${guild.name}`);
	},
};