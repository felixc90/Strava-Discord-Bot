const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const User = require('../models/User')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('Displays the weekly Strava leaderboard.'),
};

// async function getUsers(useTime) {
//     return new Promise((resolve) => {
//         WeeklyData(function (err, content) {
//             medals = ['🥇','🥈','🥉', '4th', '5th','6th','7th','8th','9th','10th']
//             data = JSON.parse(content.toString());
//             data.users.sort((user1, user2) =>  useTime ? 
//             user2.weekly_stats.total_time - user1.weekly_stats.total_time:
//             user2.weekly_stats.total_distance - user1.weekly_stats.total_distance
//             )
//             resolve(data.users.slice(0, 10).map(user => ({
//                 name: `${medals[data.users.indexOf(user)]}`,
//                 value: `${
//                     useTime ? 
//                         parseInt(user.weekly_stats.total_time) + 'min' :
//                         Math.round(parseInt(user.weekly_stats.total_distance)*100)/100.0 + 'km'} | ${
//                     user.name + (user.username === null ? '' : ` (${user.username})`)
//                 }`,
//                 inline: false,
//             })))
//         })
//     });
// }

// function WeeklyData(callback) {
//     fs.readFile("database.json", 'utf-8', function (err, content) {
//         if (err) return callback(err)
//         callback(null, content)
//     })
// }
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
                title: 'Weekly Strava Leaderboard',
                description: `======based on ${useTime ? 'time' : 'distance'}======`,
                thumbnail: {
                    url: 'https://i.imgur.com/S1lXpBX.png',
                },
                fields: await getLeaderboard(useTime),
                timestamp: new Date(),
            };
            await interaction.reply({ embeds: [leaderboardEmbed] })
        }
};

async function getLeaderboard(useTime) {
    medals = ['🥇','🥈','🥉', '4th', '5th','6th','7th','8th','9th','10th']
    const users = await User.find({})
    users.sort((user1, user2) =>  useTime ? 
        user2.weekly_stats.total_time - user1.weekly_stats.total_time:
        user2.weekly_stats.total_distance - user1.weekly_stats.total_distance
    )
    return (users.slice(0, 10).map(user => ({
        name: `${medals[users.indexOf(user)]}`,
        value: `${
            useTime ? 
                parseInt(user.weekly_stats.total_time) + 'min' :
                Math.round(parseInt(user.weekly_stats.total_distance)*100)/100.0 + 'km'} | ${
            user.name + (user.username === null ? '' : ` (${user.username})`)
        }`,
        inline: false,
    })))
}