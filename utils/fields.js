const User  = require('../models/User');
const Guild  = require('../models/Guild');

module.exports = { 
    getFields : getFields
}

async function getFields(type, userId, guildId) {
    const user = await User.findOne({discordId: userId});
    const guild = await Guild.findOne({guildId: guildId});
    switch (type) {
        case "log":
            return guild.members.find(member => member.id == user.discordId).logEntries
        default:
            break;
    }
}