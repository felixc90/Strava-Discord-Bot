const { SlashCommandBuilder } = require('@discordjs/builders');

const User = require('../models/User')
const Guild = require('../models/Guild')
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const { getLeaderboardEmbed, getMessageRow } = require('../utils/leaderboard')
const { getRunData, getStartOfPeriod, getNumActivePeriod } = require('../utils/helper')

const { createMetricStrategy } = require('../utils/metricStrategyFactory.js')


module.exports = {
	data: new SlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('Displays the weekly Strava leaderboard!'),
        async execute(interaction) {
            const guild = await Guild.findOne({guild_id: interaction.guild.id})
            guild.page_num = 1;
            console.log(guild.metric)
            metricStrategy = createMetricStrategy(guild.metric)
            console.log(guild)
            const leaderboardEmbed = await getLeaderboardEmbed(guild, metricStrategy)
            const leaderboardMessageRow = getMessageRow(guild, metricStrategy)
            guild.save()
            await interaction.reply({ embeds: [leaderboardEmbed], 
                components: [leaderboardMessageRow]})
        },
};