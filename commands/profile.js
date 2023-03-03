// const { SlashCommandBuilder } = require('@discordjs/builders');
// const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
// const dotenv = require('dotenv');
// const User  = require('../../models/User');
// const fetch = require('node-fetch');

// dotenv.config()

// module.exports = {
// 	data: new SlashCommandBuilder()
// 		.setName('profile')
// 		.setDescription('Updates the weekly stats'),
//         async execute(interaction) {
//         const user = await User.findOne({discord_id : parseInt(interaction.user.id)})
//         start = user.longest_run.start_latlng
//         end = user.longest_run.end_latlng
//         if (start == [] && end == []) {
//             location_text = ''
//         } else {
//             start_url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${start.reverse().join(',')}.json?access_token=${process.env.MAPBOX_ACCESS_TOKEN}`
//             end_url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${end.reverse().join(',')}.json?access_token=${process.env.MAPBOX_ACCESS_TOKEN}`
//             start_suburb = await fetch(start_url)
//             .then(res => res.json())
//             .then(data => {return data.features[2].text})
//             end_suburb = await fetch(end_url)
//             .then(res => res.json())
//             .then(data => {return data.features[2].text})
//             location_text = start_suburb == end_suburb ? `in ${start_suburb}!` : `from ${start_suburb} to ${end_suburb}!`
//         }
        
//         last_run = 0
//         run_found = false
//         for (let i = 0; i < user.statistics.length; i++) {
//             let week = user.statistics[i]
//             for (let num_day = 6; num_day > -1; num_day--) {
                
//                 var d = new Date();
//                 // If day is in the future
//                 if (i == 0 && num_day > (d.getDay() + 6) % 7) continue
//                 if (run_found) last_run ++
//                 if (week.statistics_by_day[num_day].total_distance != 0) run_found = true
//             }
//             if (run_found) break
//         }
//         const helpEmbed = new MessageEmbed()
//             .setColor('#0099ff')
//             .setDescription(`Joined in ${user.joined_at.toString().split(' ')[1]} ${user.joined_at.toString().split(' ')[3]}`)
//             .setTitle(`${user.name}'s Profile`)
//             .addFields(
//                 {name: '🏃‍♂️ Account Details', value: `Username: **${user.username}**${user.region == '' ? '' : `\nRegion: **${user.region}**`}
//                 Gender: **${user.sex}**
//                 Last Ran: **${last_run - 1} day(s) ago**`, inline: true},
//                 {name: '⚡️ Quick Statistics', value: `
//                 Total Runs: **${user.total_runs.toFixed(0)} min**
//                 Total Distance: **${user.total_distance.toFixed(0)}km**
//                 Total Time: **${user.total_time.toFixed(0)} min**
//                 Average Pace: **${user.total_distance == 0 ? 0 : toPace((user.total_time / user.total_distance).toFixed(2))} min/km**
//                 `, inline: true},
//                 {name: '🥳 Longest Run', value: `
//                 \'${user.longest_run.name}\' ${location_text} 
//                 completed on *${user.longest_run.date.toString().split(' ').slice(0, 4).join(' ')}*
//                 Distance: ${user.longest_run.distance.toFixed(0)}km
//                 Moving Time: ${user.longest_run.time.toFixed(0)} min
//                 Average Speed: ${toPace((user.longest_run.time/user.longest_run.distance).toFixed(2))} min/km`, inline: false},
//             )
//             .setThumbnail(user.profile)
//         await interaction.reply({embeds : [helpEmbed], ephemeral: true})
//         }
// };

// function toPace(speed) {
//     return `${parseInt(speed)}:${parseInt((speed - parseInt(speed)) * 60)}`
// }