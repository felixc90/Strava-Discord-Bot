const fetch = require('node-fetch');
const dotenv = require('dotenv');

dotenv.config()

module.exports = {
	name: 'guildCreate',
	once: true,
	execute(client) {
		console.log("Joined a new guild");
        const Guilds = client.guilds.cache.map(guild => guild.id);
        const guild_id = Guilds[Guilds.length - 1]

        // Check if the guild already exists. If so, don't add to database
        const findGuild = await Guild.findOne({guild_id: parseInt(guild_id)})
        if (findGuild != null) {
            console.log('Guild already exists!')
            return
        }
        // Add all users who were previously in the discord server
        let users = await User.find({ guilds: guild_id } , 'discord_id')
        users = users.map(user => user.discord_id)
        const guild = new Guild({
            'guild_id' : guild_id,
            'members' : users,
            'use_time' : true,
            'page_num' : 1,
        })
        await guild.save()
	},
};