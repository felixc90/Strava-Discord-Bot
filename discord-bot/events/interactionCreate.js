const fetch = require('node-fetch');
const {getEmbed, getRow} = require('../commands/leaderboard')
const Guild = require('../../models/Guild')
module.exports = {
	name: 'interactionCreate',
	async execute(client, interaction) {
        if (interaction.isCommand()) {
            const command = client.commands.get(interaction.commandName)
            if (!command) return
            try {
                console.log(`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction.`);
                await command.execute(interaction)
            } catch (error) {
                console.error(error)
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        } else if (interaction.isButton()) {
            if (interaction.customId == 'update') {
                await fetch(`${process.env.URL}update-users`, {
                    method: 'put',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        guild_id: interaction.guild.id,
                        toggle_key: true
                    })
                }).then(async () => {

                const guild = await Guild.find({guild_id: interaction.guild.id})
                const leaderboardEmbed = await getEmbed(guild[0].use_time, interaction.guild.id, 1)
                const leaderboardRow = getRow(guild[0].use_time, 1)
                await interaction.reply({ embeds: [leaderboardEmbed], components: [leaderboardRow]})
                })
                // .then(interaction.reply({ content: '⚡️stats has been updated⚡️'}));
            } else if (interaction.customId == 'toggle-key') {
                const guild = await Guild.find({guild_id: interaction.guild.id})
                guild[0].use_time = !guild[0].use_time
                await guild[0].save()
                const leaderboardEmbed = await getEmbed(guild[0].use_time, interaction.guild.id, 1)
                const leaderboardRow = getRow(guild[0].use_time, 1)
                await interaction.reply({ embeds: [leaderboardEmbed], components: [leaderboardRow]})
            } else if (interaction.customId == 'change-page') {
                const guild = await Guild.find({guild_id: interaction.guild.id})
                guild[0].page_num = 3 - guild[0].page_num
                await guild[0].save()
                const leaderboardEmbed = await getEmbed(guild[0].use_time, interaction.guild.id, guild[0].page_num)
                const leaderboardRow = getRow(guild[0].use_time, guild[0].page_num)
                await interaction.reply({ embeds: [leaderboardEmbed], components: [leaderboardRow]})
            }
        }
	}
};