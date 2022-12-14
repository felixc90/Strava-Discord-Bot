const { SlashCommandBuilder } = require('@discordjs/builders');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
const User = require('../models/User')
const Guild = require('../models/Guild')
const { getStartOfWeek } = require('../utils/helpers')
const { updateUsers } = require('../utils/update')
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

dotenv.config()
const pageSize = 10


module.exports = {
	data: new SlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('Displays the weekly leaderboard!'),
    async execute(interaction) {
      await interaction.deferReply();
      await updateUsers(interaction.guild.id)
      const reply = await createLeaderboard(interaction.guild.id)
      await interaction.editReply(reply);
  // reply = {
    // 
    // content: 'hewwo world'
  // }
  // if (fields.length > 5) reply.components = [await getMessageRow(fields, 1)]
  // await interaction.reply(reply)

    }
};

async function createLeaderboard(guildId) {
  const guild = await Guild.findOne({guildId: guildId})
  const title = `Weekly Leaderboard`;
  const description = '======based on distance======';
  const fields = await getFields(guild);
  return {
    embeds: [getMessageEmbed(title, description, fields, 1)], 
  }
}


async function getFields(guild) {
    // require the weekly data for each user
    const weeklyData = []

    // TODO
    // if (guild.members.length == 0) return {name: '👻', value: 'No records to show...', inline: false}
    for (const member of guild.members) {
        // get data for user since the start of the week
        const user = await User.findOne({ discordId : member.id}, 'username name runs').populate({path: 'runs'})
        let total = 0;
        for (const run of user.runs) {
          let differenceTime = (new Date(run.date)).getTime() - getStartOfWeek().getTime();
          if (differenceTime < 0) {
            break;
          }
          total += run.distance
        }
        weeklyData.push({
          username: user.username,
          name: user.name,
          data: total,
        })
      }
      
    // Sort data by value
    weeklyData.sort((user1, user2) =>  user1.data - user2.data)
    
    return (weeklyData.map(user => ({
        name: `${ordinal(weeklyData.indexOf(user) + 1)}`,
        value: `${user.data}km | ${
            user.name + (user.username && ` (${user.username})`)}`,
        inline: false,
    })))
}




function ordinal(n) {
    if (n <= 3) {
        medals = ['\u200b\n🥇','🥈','🥉']
        return medals[n - 1]
    }
    var s = ["th", "st", "nd", "rd"];
    var v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// async function togglePage(interaction, fields) {
//     prevMessageEmbed = interaction.message.embeds[0];
//     pageNumber = parseInt(prevMessageEmbed.footer.text.split(" ")
//     [prevMessageEmbed.footer.text.split(" ").length - 1])
//     if (interaction.customId == "prev-page") {
//         pageNumber -= 1;
//     } else if (interaction.customId == "next-page") {
//         pageNumber += 1
//     }
//     return {
//         replyMessageEmbed : getMessageEmbed(prevMessageEmbed.title, 
//             prevMessageEmbed.description, fields, pageNumber),
//         replyMessageRow :  getMessageRow(fields, pageNumber)}
// }

function getMessageEmbed(title, description, fields, pageNumber) {
  return new MessageEmbed()
    .setColor('#05CBE1')
    .setTitle(title)
    .setDescription(description)
    .setThumbnail('https://i.imgur.com/xJXLhW3.png')
    .addFields(fields.slice((pageNumber - 1) * pageSize / 2, pageNumber * pageSize / 2))
    .setTimestamp()
    .setFooter(`\u200b\n Page ${pageNumber}`);
}

// function getMessageRow(fields, pageNumber) {
//     numPages = Math.ceil(fields.length / 5);
//     const row = new MessageActionRow()
//     if (pageNumber > 1) {
//         row.addComponents(
//             new MessageButton()
//             .setCustomId('prev-page')
//             .setLabel('Prev Page')
//             .setStyle('SECONDARY'),
//         )
//     }
//     if (pageNumber < numPages) {
//         row.addComponents(
//             new MessageButton()
//             .setCustomId('next-page')
//             .setLabel('Next Page')
//             .setStyle('SECONDARY'),
//         )
//     }
//     return row;
// }





