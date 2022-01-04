const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');
const Guild  = require('../models/Guild');
const User  = require('../models/User');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('test')
		.setDescription('Generates a link'),
        async execute(interaction) {
            // console.log(interaction)
            let response = {content: 'User added to guild!', ephemeral: true}
            const findUser = await User.find({discord_id : parseInt(interaction.user.id)})
            const findGuild = await Guild.find({guild_id : parseInt(interaction.guild.id)})
            console.log(findGuild)
            if (findUser.length == 0) {
                let url = 'https://www.strava.com/oauth/authorize?client_id=71610' + 
                '&response_type=code&redirect_uri=' +
                'http://127.0.0.1:3000/add-user' + 
                `/${interaction.guild.id}` +
                `/${interaction.user.id}` + 
                `/${interaction.user.username}` + 
                '&approval_prompt=force&scope=activity:read'
                const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                    .setLabel('here!')
                    .setStyle('LINK')
                    .setURL(url),
                    );
                response = {content:'Add yourself', components: [row], ephemeral: true}
            } else {
                let user = findUser[0]
                let guild = findGuild[0]
                if (guild.members.includes(interaction.user.id)) {
                    response = {content: 'User already in guild!', ephemeral: true}
                } else {
                    user.guilds.push(interaction.guild.id)
                    guild.members.push(interaction.user.id)
                    await user.save()
                    await guild.save()
                }
            }

        await interaction.reply(response)
        }
};