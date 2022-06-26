const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');
const Guild  = require('../models/Guild');
const User  = require('../models/User');
const dotenv = require('dotenv');

dotenv.config()

module.exports = {
	data: new SlashCommandBuilder()
		.setName('register')
		.setDescription('Generates a link'),
        async execute(interaction) {
            let response = {content: 'User added to guild!', ephemeral: true}
            const user = await User.findOne({discord_id : interaction.user.id})
            const guild = await Guild.findOne({guild_id : interaction.guild.id})
            if (user == null) {
                let url = 'https://www.strava.com/oauth/authorize?client_id=71610' + 
                '&response_type=code&redirect_uri=' +
                `${process.env.URL}user/register` + 
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