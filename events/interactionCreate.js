const fetch = require('node-fetch');


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
                fetch('https://still-caverns-77918.herokuapp.com/update-users')
                .then(await interaction.reply({ content: '⚡️stats has been updated⚡️'}));
            }
        }
	}
};