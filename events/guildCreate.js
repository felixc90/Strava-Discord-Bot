const fetch = require('node-fetch');
const dotenv = require('dotenv');

const Guild = require('../models/Guild')
const User = require('../models/User')

dotenv.config()

module.exports = {
	name: 'guildCreate',
	once: true,
	async execute(client, guild) {
		console.log(`Joined ${guild.name}`);

        // Add all users who were previously in the discord server
        const newGuild = new Guild({
            'guildId' : guild.id,
            'members' : []
        })
        await newGuild.save()
	},
};