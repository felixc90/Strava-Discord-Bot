const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('Displays the weekly Strava el'),

};
module.exports = {
	data: new SlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('Displays the weekly Strava leaderboard!')
        .addSubcommand(subcommand =>
            subcommand
                .setName('time')
                .setDescription('What ran the most minutes?'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('distance')
                .setDescription('What ran the most kilometres?')),
        async execute(interaction) {
            subcommand = interaction.options._subcommand
            // if (subcommand === 'time') {
            //     await interaction.reply('time')
            // } else if (subcommand === 'distance') {
            //     await interaction.reply('distance')
            // }
            // channel.send({ embeds: [leaderboardEmbed] });
            await interaction.reply({ embeds: [leaderboardEmbed] })
        }
};


const leaderboardEmbed = new MessageEmbed()
	.setColor('#0099ff')
	.setTitle('Weekly Strava Leaderboard')
	.setURL('https://discord.js.org/')
	.setDescription('Some description here')
	.setThumbnail('https://i.imgur.com/AfFp7pu.png')
	.addFields(
		{ name: 'Regular field title', value: 'Some value here' },
		{ name: '\u200B', value: '\u200B' },
		{ name: 'Inline field title', value: 'Some value here', inline: true },
		{ name: 'Inline field title', value: 'Some value here', inline: true },
	)
	.addField('Inline field title', 'Some value here', true)
	.setImage('https://i.imgur.com/AfFp7pu.png')
	.setTimestamp()
	.setFooter('Some footer text here', 'https://i.imgur.com/AfFp7pu.png');