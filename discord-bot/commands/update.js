const { SlashCommandBuilder } = require('@discordjs/builders');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
const User = require('../../models/User');
const Guild = require('../../models/Guild');


dotenv.config()

module.exports = {
	data: new SlashCommandBuilder()
		.setName('forceupdate')
		.setDescription('Updates running data for everyone in the server!'),
        async execute(interaction) {
        await fetch(`${process.env.URL}guild/update`, {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                guild_id: interaction.guild.id
            })
        })
        // const guild = await Guild.findOne({guild_id: interaction.guild.id})
        // const users = await User.find({discord_id : { $in: guild.members }}, 'username most_recent_run')
        return_string = ''
        // time = new Date()
        // for (let i = 0; i < users.length; i++) {
        //     difference_time = time.getTime() - users[i].most_recent_run.time.getTime();
        //     difference_days = difference_time / (1000 * 3600 * 24)
        //     if (!users[i].most_recent_run.updated_guilds.includes(interaction.guild.id)
        //     && difference_days < 2) {
        //         return_string += `${users[i].username} just ran ${users[i].most_recent_run.distance} km. Give kudos 👍 here: https://www.strava.com/activities/${users[i].most_recent_run.id}\n`
        //         users[i].most_recent_run.updated_guilds.push(interaction.guild.id)
        //         await users[i].save()
        //     }
        // }
        if (return_string == '') return_string = '⚡️ Stats have been updated! ⚡️'
        await interaction.reply({content : return_string})
        }
};