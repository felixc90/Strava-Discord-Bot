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
            // await interaction.reply({ content : "los"})
            const title = `${user.name}'s Running Log`;
            const description = "'============================'";
            reply = {
                embeds: [await getMessageEmbed(title, description, fields, 1)], 
            }
            if (fields.length > 5) reply.components = [await getMessageRow(fields, 1)]
            await interaction.reply(reply)
        }
};