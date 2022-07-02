const { SlashCommandBuilder } = require('@discordjs/builders');
const User = require('../models/User')
const fetch = require('node-fetch');
const { getStartOfPeriod } = require('../helpers/dataHelper')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('test')
		.setDescription('test'),
        async execute(interaction) {
            const user = await User.findOne({discord_id: interaction.user.id})
            getMileageData((await user.statistics.populate({path: 'runs'})).runs, "week", 10)
        }
};


async function getMileageData(runs, time_unit, active_periods) {
    let index = 0
    let dates = []
    let distances = []
    let curr_date = getStartOfPeriod(new Date(), time_unit)
    let period_mileage = 0
    while (index < active_periods) {
        while (curr_date.getTime() == getStartOfPeriod(runs[index].date, time_unit).getTime()) {
            if (dates.length > 0 && curr_date.getTime() == dates[dates.length - 1].getTime()) {
                distances[distances.length - 1] += runs[index].distance
            } else {
                dates.push(curr_date)
                distances.push(runs[index].distance)
            }
            index += 1
        }
        if (index == active_periods) {break}
        curr_date = getStartOfPeriod(curr_date - 1, time_unit)
        dates.push(curr_date)
        distances.push(0)
    }
    // Bug here
    // console.log(distances, dates)
    return {
        dates: dates,
        distances, distances
    }
}