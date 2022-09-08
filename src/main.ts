import 'reflect-metadata'

import { dirname, importx } from '@discordx/importer'
import type { Interaction } from 'discord.js'
import { IntentsBitField } from 'discord.js'
import { Client } from 'discordx'

import chalk from 'chalk'

import config from './config/config.json' assert {type:'json'}

export const bot = new Client({
  // Discord intents
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildMessageReactions,
    IntentsBitField.Flags.GuildVoiceStates,
  ],

  // Debug logs are disabled in silent mode
  silent: false,

  // Configuration for @SimpleCommand
  simpleCommand: {
    prefix: '>',
  },
})

bot.once('ready', async () => {
  // Make sure all guilds are cached
  await bot.guilds.fetch()

  // Synchronize applications commands with Discord
  await bot.initApplicationCommands()

  console.log(chalk.red('Bot started'))
})

bot.on('interactionCreate', (interaction: Interaction) => {
  bot.executeInteraction(interaction)
})

async function run() {
  await importx(dirname(import.meta.url) + '/{events,commands}/**/*.{ts,js}')

  await bot.login(config.token)
}

import { initDatabase } from './lib/dbHandler.js'
import { initalizeScheduler } from './lib/scheduler.js'
await initDatabase()
initalizeScheduler()

run()
