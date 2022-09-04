const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

module.exports = {
    getMessageEmbed : getMessageEmbed,
    getMessageRow : getMessageRow,
    togglePage : togglePage,
}

async function togglePage(interaction, fields) {
    prevMessageEmbed = interaction.message.embeds[0];
    pageNumber = parseInt(prevMessageEmbed.footer.text.split(" ")
    [prevMessageEmbed.footer.text.split(" ").length - 1])
    if (interaction.customId == "prev-page") {
        pageNumber -= 1;
    } else if (interaction.customId == "next-page") {
        pageNumber += 1
    }
    return {
        replyMessageEmbed : getMessageEmbed(prevMessageEmbed.title, 
            prevMessageEmbed.description, fields, pageNumber),
        replyMessageRow :  getMessageRow(fields, pageNumber)}
}

function getMessageEmbed(title, description, fields, pageNumber) {
    console.log(title, description)
    return new MessageEmbed()
        .setColor('#05CBE1')
        .setTitle(title)
        .setDescription(description)
        .setThumbnail('https://i.imgur.com/xJXLhW3.png')
        .addFields(fields.slice((pageNumber - 1) * 5, pageNumber * 5))
        .setTimestamp()
        .setFooter(`\u200b\n Page ${pageNumber}`);
}

function getMessageRow(fields, pageNumber) {
    numPages = Math.ceil(fields.length / 5);
    const row = new MessageActionRow()
    if (pageNumber > 1) {
        row.addComponents(
            new MessageButton()
            .setCustomId('prev-page')
            .setLabel('Prev Page')
            .setStyle('SECONDARY'),
        )
    }
    if (pageNumber < numPages) {
        row.addComponents(
            new MessageButton()
            .setCustomId('next-page')
            .setLabel('Next Page')
            .setStyle('SECONDARY'),
        )
    }
    return row;
}
