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
        let users = await User.find({ guilds: guild.id } , 'discordId')
        const newGuild = new Guild({
            'guildId' : guild.id,
            'members' : users.map(user => user.discordId),
            'pageNumber' : 1
        })
        await newGuild.save()
	},
};