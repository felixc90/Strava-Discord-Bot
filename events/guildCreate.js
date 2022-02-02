const fetch = require('node-fetch');
const dotenv = require('dotenv');

dotenv.config()

module.exports = {
	name: 'guildCreate',
	once: true,
	execute(client) {
		console.log("Joined a new guild");
        const Guilds = client.guilds.cache.map(guild => guild.id);
        console.log(Guilds[Guilds.length - 1]);
        fetch(`${process.env.URL}add-guild`, {
            method: 'post',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                guild_id: Guilds[Guilds.length - 1]
            })
        }).then(res => res.json())
	},
};