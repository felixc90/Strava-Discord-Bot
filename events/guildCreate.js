const fetch = require('node-fetch');
const dotenv = require('dotenv');

const Guild = require('../models/Guild')
const User = require('../models/User')

dotenv.config()

module.exports = {
	name: 'guildCreate',
	once: true,
	async execute(client, guild) {
    const newGuild = new Guild({
      'guildId' : guild.id,
      'members' : []
    })
    await newGuild.save()
    console.log(`Added guild: ${guild.name}`);
	},
};