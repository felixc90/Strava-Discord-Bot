const { getRunData, getStartOfPeriod, getNumActivePeriod } = require('../utils/helper')
const { SlashCommandBuilder } = require('@discordjs/builders');
const fetch = require('node-fetch');
const User = require('../models/User')
const { reAuthorize } = require('../utils/update')
module.exports = {
	data: new SlashCommandBuilder()
		.setName('random')
		.setDescription('Adds randomised activities to the user\'s Strava'),
        async execute(interaction) {
            const user = await User.findOne({discord_id : interaction.user.id})
            const runs = (await user.statistics.populate({path: 'runs'})).runs
            const lastRunDate = getStartOfPeriod(runs[0].date, "day")
            let count = 0
            let currDate = getStartOfPeriod(new Date(), "day")
            while (currDate - lastRunDate > 0) {
                currDate = getStartOfPeriod(currDate - 1, "day")
                // console.log(getStartOfPeriod(currDate, "day"))
            }
            await fetch(`https://www.strava.com/api/v3/activities?access_token=${await reAuthorize(user)}`, {
                method: 'post',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: new Date(),
                    sport_type: 'Run',
                    elapsed_time: Math.random() * (6000 - 1200) + 1200,
                    distance: Math.random() * (16000 - 4000) + 4000,
                    start_date_local: new Date()
                })
            }).then((res) => console.log(res))
            
            await interaction.reply({content: "passed"})
        }

};