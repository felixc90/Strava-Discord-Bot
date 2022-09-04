const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');
const Guild  = require('../models/Guild');
const User  = require('../models/User');
const dotenv = require('dotenv');

dotenv.config()

module.exports = {
	data: new SlashCommandBuilder()
		.setName('register')
		.setDescription('Generates a link to register your Strava account to Achilles'),
        async execute(interaction) {
            let response = {content: 'User added to guild!', ephemeral: true}
            const user = (await User.findOne({discordId : interaction.user.id}))
            const guild = await Guild.findOne({guildId : interaction.guild.id})

            if (user != null) {
                if (!guild.members.map(member => member.id).includes(interaction.user.id)) {
                    guild.members.push({
                        'id' : user.discordId,
                        'joinedAt' : new Date(),
                        'totalExp' : 0,
                        'modifiers' : [],
                        'mostRecentRunId' : -1,
                        'logEntries' : []
                    })
                    await guild.save()
                    await interaction.reply({content: 'User added to guild!', ephemeral: true})
                } else {
                    await interaction.reply({content: 'User already in guild!', ephemeral: true})
                }
                return;
            }

            let url = 'https://www.strava.com/oauth/authorize?client_id=71610' + 
            '&response_type=code&redirect_uri=' +
            `${process.env.URL}user/register` + 
            `/${interaction.guild.id}` +
            `/${interaction.user.id}` + 
            `/${interaction.user.username}` + 
            '&approval_prompt=force&scope=activity:write,activity:read'
            const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                .setLabel('Click here!')
                .setStyle('LINK')
                .setURL(url),
                );
            await interaction.reply({content:'Register your Strava account with Achilles', components: [row], ephemeral: true})
        }
};