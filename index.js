const { Client, Collection, Intents } = require('discord.js');
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const fs = require('fs');
dotenv.config();

const myIntents = new Intents();
myIntents.add(Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILDS);
const client = new Client({ intents: myIntents });

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command)
}

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(client,...args));
	} else {
		client.on(event.name, (...args) => event.execute(client,...args));
	}
}

var url = process.env.MONGODB_CONNECT
mongoose
    .connect(url, {useNewUrlParser : true, useUnifiedTopology : true})
    .then(() => {
        client.login(process.env.DISCORD_TOKEN)
    })
