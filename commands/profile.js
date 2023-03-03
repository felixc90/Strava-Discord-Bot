const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const dotenv = require('dotenv');
const User  = require('../models/User');
const fetch = require('node-fetch');

dotenv.config()

module.exports = {
	data: new SlashCommandBuilder()
		.setName('profile')
		.setDescription('Updates the weekly stats'),
        async execute(interaction) {
        const user = await User.findOne({discord_id : parseInt(interaction.user.id)})
        let longestRun = user.runs[0];
        start = longestRun.startLatlng
        end = longestRun.endLatlng
        if (start == [] && end == []) {
            location_text = ''
        } else {
            start_url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${start.reverse().join(',')}.json?access_token=${process.env.MAPBOX_ACCESS_TOKEN}`
            end_url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${end.reverse().join(',')}.json?access_token=${process.env.MAPBOX_ACCESS_TOKEN}`
            start_suburb = await fetch(start_url)
            .then(res => res.json())
            .then(data => {return data.features[2].text})
            end_suburb = await fetch(end_url)
            .then(res => res.json())
            .then(data => {return data.features[2].text})
            location_text = start_suburb == end_suburb ? `in ${start_suburb}!` : `from ${start_suburb} to ${end_suburb}!`
        }

        const date1 = new Date(user.runs[0].date);
        const date2 = new Date();
        const diffTime = Math.abs(date2 - date1);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        console.log(longestRun.time)
        console.log(longestRun.distance)
        console.log(user.totalTime)
        console.log(user.totalDistance)
        user.totalTime / user.totalDistance
        const helpEmbed = new MessageEmbed()
            .setColor('#0099ff')
            // .setDescription(`Joined in ${user.joined_at.toString().split(' ')[1]} ${user.joined_at.toString().split(' ')[3]}`)
            .setDescription('lol')
            .setTitle(`${user.name}'s Profile`)
            .addFields(
              // TODO region
                {name: '🏃‍♂️ Account Details', value: `Username: **${user.username}**${!user.region ? '' : `\nRegion: **${user.region}**`}${!user.sex ? '' : `\nGender: **${user.sex}**`}
                Last Ran: **${diffDays} day(s) ago**`, inline: true},
                {name: '⚡️ Quick Statistics', value: `
                Total Runs: **${user.totalRuns.toFixed(0)}**
                Total Distance: **${user.totalDistance.toFixed(0)}km**
                Total Time: **${user.totalTime.toFixed(0)} min**
                Average Pace: **${user.totalDistance == 0 ? 0 : toPace((user.totalTime / user.totalDistance).toFixed(2))} min/km**
                `, inline: true},
                {name: '🥳 Longest Run', value: `
                \'${longestRun.name}\' ${location_text} 
                completed on *${longestRun.date.toString().split(' ').slice(0, 4).join(' ')}*
                Distance: ${longestRun.distance.toFixed(0)}km
                Moving Time: ${longestRun.time.toFixed(0)} min
                Average Speed: ${toPace((longestRun.time/longestRun.distance).toFixed(2))} min/km`, inline: false},
            )
            .setThumbnail(user.profile)
        await interaction.reply({embeds : [helpEmbed], ephemeral: true})
        }
};

function toPace(speed) {
    let minutes = parseInt(speed);
    let seconds = parseInt((speed - parseInt(speed)) * 60);
    seconds = seconds < 10 ? '0' + seconds.toString() : seconds;
    console.log(minutes, seconds)
    return `${minutes}:${seconds}`
}