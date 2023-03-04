# Achilles Discord Bot

## About
Achilles is a Discord bot that allows you and your mates to compare your athletic progress and compete for a top place in the weekly leaderboard. Visualise your Strava data through graphs and tables that track your and up to one other user's long-term athletic development as well as a heatmap that can be found on the hosting website.

## Commands
| Command                                        | Description                                                                                                                                   | Example                        |
|------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------|
| /register                                      | Generates a unique link that allows the discord user to register their Strava account and data into the server.                               | /register                      |
| /update                                        | Force updates the runs of all registered users in the current server.                                                                         | /update                        |
| /leaderboard                                   | Displays a leaderboard of the top 10 athletes based on either time run or distance run using the data of all users registered in the server.  | /leaderboard                   |
| /graph <unit_of_time> <nperiods> <user (optional)>      | Plots a graph of the mileage of the user and one other (optional) over the last n-periods of unit-of-time e.g. last 10 days.                                  | /mileage day user:felixc90     |
| /profile                                       | Shows the user's Strava details, quick statistics as well as their longest run and achievements.                                                               |                                |
| /help                                          | Presents the list of possible commands.                                                                                                       |                                |


## Things to note
- The bot uses the Strava API to gain all relevant data.
- Due to pagination and limited requests from Strava's API, when a new user registers, only runs later than the start of the previous year are recorded
- The bot needs to update all users first via the command \leaderboard before commands like \profile are run (at the very start)
- If a server kicks the bot, their data is deleted in compliance with Discord's data policies.
- The bot can be added to a server by clicking [here](https://discord.com/oauth2/authorize?client_id=925565690054856735&permissions=8&scope=bot%20applications.commands)!
