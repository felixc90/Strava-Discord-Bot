const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const dotenv = require('dotenv')

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

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`)
})

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName)
    if (!command) return
    try {
        await command.execute(interaction)
    } catch (error) {
        console.error(error)
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

client.on("messageCreate", msg => {
    let prefix = "+"
    if (!msg.content.startsWith(prefix)) {
        return
    }
    let command = msg.content.split(' ')[0].slice(1);
    let args = msg.content.replace(prefix + command, '').trim();
    switch(command) {
        case 'I':
            msg.reply("want")
            break
        case 'it':
            msg.reply("that")
            break
        case 'way':
            msg.reply("Tell")
            break
        case 'me':
            msg.reply("why...")
            break
        case 'aint':
            msg.reply("nothing")
            break
        case 'but':
            msg.reply("a")
            break
        case 'heartache':
            msg.reply("a")
            break
    }

})
client.login(process.env.DISCORD_TOKEN)