import { Client, Intents } from 'discord.js'
import dotenv from 'dotenv'

dotenv.config();
const myIntents = new Intents();
myIntents.add(Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILDS);
const client = new Client({ intents: myIntents });

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`)
})

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