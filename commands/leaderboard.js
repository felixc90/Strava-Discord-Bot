const { SlashCommandBuilder } = require('@discordjs/builders');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
const User = require('../models/User')
const Guild = require('../models/Guild')
const { getFields } = require('../utils/fields')
const { getMessageEmbed, getMessageRow } = require('../utils/pages')
const { updateUsers } = require('../utils/update')

dotenv.config()

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('Displays the weekly leaderboard!'),
        async execute(interaction) {
            await updateUsers(interaction.guild.id)
            const fields = await getFields("leaderboard", interaction.user.id, interaction.guild.id)
            const user = await User.findOne({discordId: interaction.user.id}, 'name');
            const title = `Weekly Leaderboard`;
            const description = "something";
            fields = [{'name' : 'name', 'value' : 'value', 'inline' : false}]
            await interaction.reply({ 
                embeds: [await getMessageEmbed(title, description, fields, 1)], 
                components: [await getMessageRow(fields, 1)]})
        }
};