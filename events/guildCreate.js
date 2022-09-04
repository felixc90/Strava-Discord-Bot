const fetch = require('node-fetch');
const dotenv = require('dotenv');

const Guild = require('../models/Guild')
const User = require('../models/User')

dotenv.config()

module.exports = {
	name: 'guildCreate',
	once: true,
	async execute(client) {
		console.log("Joined a new guild");
        const guilds = client.guilds.cache.map(guild => guild.id);
        const guildId = guilds[guilds.length - 1]

        // Check if the guild already exists. If so, don't add to database
        const findGuild = await Guild.findOne({guildId: parseInt(guildId)})
        if (findGuild != null) {
            console.log('Guild already exists!')
            return
        }
        // Add all users who were previously in the discord server
        let users = await User.find({ guilds: guildId } , 'discord_id')
        users = users.map(user => user.discord_id)
        const guild = new Guild({
            'guildId' : guildId,
            'members' : users,
            'metric' : "distance",
            'pageNumber' : 1,
        })
        await guild.save()
	},
};