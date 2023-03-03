# Achilles Discord Bot

## About
Achilles is a Discord bot that allows you and your mates to compare your athletic progress and compete for a top place in the weekly leaderboard. Visualise your Strava data through graphs and tables that track your and up to one other user's long-term athletic development as well as a heatmap that can be found on the hosting website.

## Commands
| Command                                        | Description                                                                                                                                   | Example                        |
|------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------|
| /register                                      | Generates a unique link that allows the discord user to register their Strava account and data into the server.                               | /register                      |
| /update                                        | Force updates the runs of all registered users in the current server.                                                                         | /update                        |
| /leaderboard                                   | Displays a leaderboard of the top 10 athletes based on either time run or distance run using the data of all users registered in the server.  | /leaderboard                   |
| /mileage <unit_of_time> <user (optional)>      | Plots a graph of the mileage of the user and one other (optional) over the users' last active days or weeks.                                  | /mileage day user:felixc90     |
| /statistics  <unit_of_time>  <user (optional)> | Constructs a tabular visualisation of the running statistics of the user and one other (optional) over the users' last active days or weeks.  | /statistics week user:felixc90 |
| /profile                                       | Shows the user's Strava details, quick statistics as well as their longest run.                                                               |                                |
| /help                                          | Presents the list of possible commands.                                                                                                       |                                |


## Things to note
- The bot uses the Strava API to gain all relevant data.
- Due to pagination, the program will not look past a user's most recent 30 activities for new runs.
- Heroku free hosting sometimes lags and as a result, the update button on the leaderboard is variable and often requires up to three pushes.
- If a server kicks the bot, their data is deleted in compliance with Discord's data policies.
- The bot can be added to a server by clicking [here](https://discord.com/oauth2/authorize?client_id=925565690054856735&permissions=8&scope=bot%20applications.commands)!
