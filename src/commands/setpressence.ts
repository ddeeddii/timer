import { ActivityType, ApplicationCommandOptionType, CommandInteraction, PresenceStatusData } from 'discord.js'
import { Discord, Slash, SlashChoice, SlashOption } from 'discordx'
import { bot } from '../main.js'
import config from '../config/config.json' assert {type:'json'}

@Discord()
export class setPresence {
  @Slash({ name: 'setpresence', description: 'Set the bot\'s presence' })
  setpressence(
    text: string,
    @SlashOption({
      name: 'text',
      description: 'Set the bot\'s activity text',
      required: true,
      type: ApplicationCommandOptionType.String,
    })

    activity: ActivityType,
    @SlashOption({
      name: 'activity',
      description: 'Set the bot\'s activity type',
      required: true,
      type: ApplicationCommandOptionType.Number,
    })
    @SlashChoice({ name: 'Playing', value: ActivityType.Playing })
    @SlashChoice({ name: 'Streaming', value: ActivityType.Streaming })
    @SlashChoice({ name: 'Listening to', value: ActivityType.Listening })
    @SlashChoice({ name: 'Watching', value: ActivityType.Watching })
    @SlashChoice({ name: 'Competing in', value: ActivityType.Competing })


    status: PresenceStatusData,
    @SlashOption({
      name: 'status',
      description: 'Set the bot\'s status',
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    @SlashChoice({ name: 'Online', value: 'online' })
    @SlashChoice({ name: 'Idle', value: 'idle' })
    @SlashChoice({ name: 'Do Not Disturb', value: 'dnd' })
    @SlashChoice({ name: 'Invisible', value: 'invisible' })

    silent: boolean,
    @SlashOption({
      name: 'silent',
      description: 'Should the command be only visible to you? (default: true)',
      required: false,
      type: ApplicationCommandOptionType.Boolean
    })

    interaction: CommandInteraction
  ): void {
    if(silent == undefined){
      silent = true
    }

    if(interaction.user.id != config.ownerId){
      interaction.reply({
        content: `⛔ You are not the bot owner!`,
        ephemeral: silent
      })
      return
    }

    bot.user?.setPresence({
      activities: [{name: text, type: activity as ActivityType.Playing}],
      status: status
    })

    interaction.reply({
      content: `Set the bot's activity text to **${text}**, activity to \`${activity}\` status to \`${status}\`!`,
      ephemeral: silent
    })
  }
}