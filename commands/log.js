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
		.setName('log')
		.setDescription('Updates running data for everyone in the server!'),
        async execute(interaction) {
            await updateUsers(interaction.guild.id)
            const fields = await getFields("log", interaction.user.id, interaction.guild.id)
            const user = await User.findOne({discordId: interaction.user.id}, 'name');
            const title = `${user.name}'s Running Log`;
            const description = "something";
            await interaction.reply({ 
                embeds: [await getMessageEmbed(title, description, fields, 1)], 
                components: [await getMessageRow(fields, 1)]})
        }
};