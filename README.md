# Timer Bot
Important: This bot is **not** meant to be used in multiple guilds, hence it does not support per-guild data.

# Features
- Timezone support
- Timers
- Counters

## Timezone support
Each user has to set their timezone in order to create a timer.
This ensures the time they set as an end date is accurrate for them. Otherwise, there might arise problems.
This also allows you to check a list of every users' timezone (and local time), aswell as check a singular user's timezone 

## Timers
Supports creating timers without a set time. Those are called stopwatch timers.
Supports setting per-channel notifications for each timer.
You can subscribe to a timer to receive a ping whenever a notification triggers.
Also supports setting custom notification text with plenty custom parameters.

## Counters
You can create a counter, add any value to it or set it to something.

# Usage
- Clone the repo
- Run `npm install`
- Configure `src/config/config.json` with a token
- Run `npm run build` & `npm run start` or start with Typescript directly via `npm run dev`

Created using `discordx` & `create-discordx`
