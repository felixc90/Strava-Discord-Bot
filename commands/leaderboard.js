const { SlashCommandBuilder } = require('@discordjs/builders');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
const User = require('../models/User')
const Guild = require('../models/Guild')
const { getStartOfWeek } = require('../utils/helpers')
const { updateUsers } = require('../utils/update')
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

dotenv.config()
const pageSize = 5
const numRanks = 10


module.exports = {
	data: new SlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('Displays the weekly leaderboard!'),
    async execute(interaction) {
      await interaction.deferReply();
      await updateUsers(interaction.guild.id)
      const reply = await createLeaderboard(interaction.guild.id)
      await interaction.editReply(reply);
    },
  togglePage : togglePage
};

async function createLeaderboard(guildId) {
  const guild = await Guild.findOne({guildId: guildId})
  const title = `Weekly Leaderboard`;
  const description = '======based on distance======';
  const fields = await getFields(guild);
  return {
    embeds: [getMessageEmbed(title, description, fields, 1)],
    components: [getMessageRow(fields, 1)]
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

  for (let i = 0; i < 10; i++) {
    if (i === 1) {
      continue
    }
    let newData = {
      data: 0,
      username: "",
      name: ""
    };
    newData.data = weeklyData[0].data * i;
    newData.username = weeklyData[0].username + i.toString();
    newData.name += weeklyData[0].name + i.toString();
    weeklyData.push(newData)
  }

  for (let i = -10; i < 0; i++) {
    if (i === 1) {
      continue
    }
    let newData = {
      data: 0,
      username: weeklyData[0].username,
      name: ""
    };
    newData.data = weeklyData[0].data * i;
    newData.name += weeklyData[0].name + i.toString();
    weeklyData.push(newData)
  }
    
  // Sort data by value
  weeklyData.sort((user1, user2) => user2.data - user1.data)

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



function getMessageEmbed(title, description, fields, pageNumber) {
  return new MessageEmbed()
    .setColor('#05CBE1')
    .setTitle(title)
    .setDescription(description)
    .setThumbnail('https://i.imgur.com/xJXLhW3.png')
    .addFields(fields.slice((pageNumber - 1) * pageSize, pageNumber * pageSize))
    .setTimestamp()
    .setFooter(`\u200b\n Page ${pageNumber}`);
}

function getMessageRow(fields, pageNumber) {
  const numPages = Math.ceil(Math.min(fields.length, numRanks) / pageSize);
  const row = new MessageActionRow()
  console.log(pageNumber, numPages)
  row.addComponents(
    new MessageButton()
    .setCustomId('prev-page')
    .setLabel('Prev Page')
    .setStyle('SECONDARY')
    .setDisabled(pageNumber === 1),
    new MessageButton()
    .setCustomId('next-page')
    .setLabel('Next Page')
    .setStyle('SECONDARY')
    .setDisabled(pageNumber === numPages),
  )
  return row;
}

async function togglePage(interaction) {
  const guild = await Guild.findOne({ guildId : interaction.guild.id})
  const fields = await getFields(guild)

  const prevMessageEmbed = interaction.message.embeds[0];
  let pageNumber = parseInt(prevMessageEmbed.footer.text.split(" ")
    [prevMessageEmbed.footer.text.split(" ").length - 1])
  if (interaction.customId == "prev-page") {
      pageNumber -= 1;
  } else if (interaction.customId == "next-page") {
      pageNumber += 1
  }

  await interaction.update({
    embeds: [getMessageEmbed(prevMessageEmbed.title, prevMessageEmbed.description, fields, pageNumber)],
    components: [getMessageRow(fields, pageNumber)]
  })
}

