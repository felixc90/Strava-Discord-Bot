import { Client, Intents } from 'discord.js'
import dotenv from 'dotenv'

dotenv.config();
const myIntents = new Intents();
myIntents.add(Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILDS);
const client = new Client({ intents: myIntents });

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`)
})

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;

	if (commandName === 'ping') {
		await interaction.reply('Pong!');
	} else if (commandName === 'server') {
		await interaction.reply(`Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`);
	} else if (commandName === 'user') {
		await interaction.reply(`Your tag: ${interaction.user.tag}\nYour id: ${interaction.user.id}`);
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