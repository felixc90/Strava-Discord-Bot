const fetch = require('node-fetch');
const Guild = require('../models/Guild')
const { updateUsers } = require('../utils/update')
const { getLeaderboardEmbed, getMessageRow } = require('../utils/leaderboard')


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
            const guild = await Guild.findOne({guild_id: interaction.guild.id})
            if (interaction.customId == 'update') {
                await updateUsers(guild.guild_id)
            } else if (interaction.customId == 'toggle-key') {
                guild.use_time = !guild.use_time
            } else if (interaction.customId == 'change-page') {
                guild.page_num = 3 - guild.page_num
            }
            await guild.save()
            const leaderboardEmbed = await getLeaderboardEmbed(guild)
            const leaderboardRow = getMessageRow(guild)
            await interaction.reply({ embeds: [leaderboardEmbed], components: [leaderboardRow]})
        }
	}
};