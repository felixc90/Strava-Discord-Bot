const fetch = require('node-fetch');
const dotenv = require('dotenv');

const Guild = require('../models/Guild')
const User = require('../models/User')

dotenv.config()

module.exports = {
	name: 'guildDelete',
	once: true,
	async execute(client, guild) {
        // Find the guild with the given id
        if (await Guild.deleteOne({guildId: guild.id}) != 1) {
            console.log("Error occurred");
            return;
        }
        console.log(`Removed from ${guild.name}`);
	},
};