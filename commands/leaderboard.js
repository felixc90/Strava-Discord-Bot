const { SlashCommandBuilder } = require('@discordjs/builders');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
const User = require('../models/User')
const Guild = require('../models/Guild')
const { getStartOfPeriod } = require('../utils/helpers')
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
  // TODO IMPLEMENT TIME
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

  for (const member of guild.members) {
    // get data for user since the start of the week
    const user = await User.findOne({ discordId : member.id}, 'username name runs').populate({path: 'runs'})
    let total = 0;
    for (const run of user.runs) {
      let differenceTime = (new Date(run.date)).getTime() - getStartOfPeriod(new Date(), 'week').getTime();
      if (differenceTime < 0) {
        break;
      }
      // TODO IMPLEMENT TIME
      total += run.distance
    }
    weeklyData.push({
      username: user.username,
      name: user.name,
      data: Math.round(total * 10) / 10,
    })
  }


  // artifical data
  const names = ["Cornflower Blue", "Green Yellow", "Moccasin", "Steel Blue", "Medium Slate Blue", "Light Green", "Medium Sea Green", "Slate Blue", "Thistle", "Light Pink", "Medium Purple", "Turquoise", "Lawn Green", "Light Goldenrod Yellow", "Honeydew", "Olive", "Lime", "Purple", "Beige", "Pale Turquoise", "Navajo White", "Sienna", "Midnight Blue", "Gray", "Deep Pink", "Dark Slate Gray", "Medium Spring Green", "Violet", "White Smoke", "Hot Pink", "Floral White", "Goldenrod", "Dark Violet", "Misty Rose", "Coral", "Snow", "Amethyst", "Fire Brick", "Dodger Blue", "Indian Red", "Sandy Brown", "Dark Sea Green", "Black", "Blue", "Lavender", "Medium Slate Blue", "Aquamarine", "Orange Red", "Light Coral", "Slate Gray", "Rosy Brown", "Powder Blue", "Dark Magenta", "Sea Green", "Light Sky Blue", "Green", "Burly Wood", "Bisque", "Gold", "Crimson", "Dark Slate Blue", "Medium Violet Red", "Aqua", "Dark Goldenrod", "Light Salmon", "Plum", "Teal", "Orange", "Dark Orchid", "Linen", "Pale Violet Red", "Light Sea Green", "Old Lace", "Chocolate", "Peach Puff", "Orchid", "Red", "Medium Aquamarine", "Gainsboro", "Khaki", "Pale Goldenrod", "Yellow Green", "Dark Blue", "Blanched Almond", "Forest Green", "Dark Red", "Light Steel Blue", "Medium Orchid", "Olive Drab", "Saddle Brown", "Alice Blue", "Mint Cream", "Azure", "Antique White", "Seashell", "Navy", "Light Grey", "Pale Green", "Magenta", "Tomato"]
  for (let i = 0; i < 5; i++) {
    const value = Math.floor(Math.random() * 100)
    let newData = {
      data: value,
      username: names[value].split(' ').map(word => word[0]).join(''),
      name: names[value]
    };
    weeklyData.push(newData)
  }
    

  if (guild.members.length == 0) {
    return {name: '👻', value: 'No records to show...', inline: false}
  }
  // Sort data by value
  weeklyData.sort((user1, user2) => user2.data - user1.data)

  return (weeklyData.map(user => ({
    name: `${ordinal(weeklyData.indexOf(user) + 1)}`,
    // TODO IMPLEMENT TIME
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
  row.addComponents(
    new MessageButton()
    .setCustomId('prev-page')
    .setLabel('Prev Page')
    .setStyle('DANGER')
    .setDisabled(pageNumber === 1),
    new MessageButton()
    .setCustomId('next-page')
    .setLabel('Next Page')
    .setStyle('SUCCESS')
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