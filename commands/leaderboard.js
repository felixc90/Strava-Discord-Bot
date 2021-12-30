const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('Displays the weekly Strava el'),
};

async function getUsers() {
    return new Promise((resolve) => {
        WeeklyData(function (err, content) {
            medals = ['🥇','🥈','🥉', '4th', '5th','6th','7th','8th','9th','10th']
            data = JSON.parse(content.toString());
            data.users.sort((user1, user2) =>  user2.weekly_stats.total_distance - user1.weekly_stats.total_distance)
            resolve(data.users.slice(0, 10).map(user => ({
                name: `${medals[data.users.indexOf(user)]}`,
                value: `${Math.round(parseInt(user.weekly_stats.total_distance)*100)/100.0}km | ${
                    user.name + (user.username === null ? '' : ` (${user.username})`)
                }`,
                inline: false,
            })))
        })
    });
}

function WeeklyData(callback) {
    fs.readFile("database.json", 'utf-8', function (err, content) {
        if (err) return callback(err)
        callback(null, content)
    })
}
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
            let useTime = true;
            if (interaction.options.getSubcommand() === 'distance') {
                useTime = false;
            }

            const leaderboardEmbed = {
                color: 0x0099ff,
                title: `Weekly Strava Leaderboard (${useTime ? 'Time' : 'Distance'})`,
                // description: 'Some description here',
                thumbnail: {
                    url: 'https://i.imgur.com/S1lXpBX.png',
                },
                fields: await getUsers(),
                timestamp: new Date(),
            };
            await interaction.reply({ embeds: [leaderboardEmbed] })
        }
};


