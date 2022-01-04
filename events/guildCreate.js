const fetch = require('node-fetch');

module.exports = {
	name: 'guildCreate',
	once: true,
	execute(client) {
		console.log("Joined a new guild");
        const Guilds = client.guilds.cache.map(guild => guild.id);
        console.log(Guilds[Guilds.length - 1]);
        fetch('https://still-caverns-77918.herokuapp.com/add-guild', {
            method: 'post',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                guild_id: Guilds[Guilds.length - 1]
            })
        }).then(res => res.json())
	},
};