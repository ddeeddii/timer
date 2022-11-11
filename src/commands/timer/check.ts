import { ApplicationCommandOptionType, AutocompleteInteraction, CommandInteraction } from 'discord.js'
import { Discord, Slash, SlashGroup, SlashOption } from 'discordx'
import { DateTime } from 'luxon'
import { getTimeDifference } from '../../lib/common/dateUtils.js'
import { getAutocomplete, getDiscordTimestamp } from '../../lib/common/miscUtils.js'
import { TimerList } from '../../lib/dbHandler.js'
import { TimerType } from '../../lib/types.js'

@Discord()
@SlashGroup({ name: 'timer', description: 'Timer'})
export class TimerCheck {
  @Slash({ name: 'check', description: 'Check when a timer ends or how much time has elapsed' })
  @SlashGroup('timer')
  check(
    searchText: string,
    @SlashOption({
      autocomplete: (interaction: AutocompleteInteraction) => {
        const autocompleteData = getAutocomplete(interaction.options.getFocused(), TimerList)

        interaction.respond(autocompleteData)
      },

      name: 'timer-name',
      description: 'Name of the timer',
      required: true,
      type: ApplicationCommandOptionType.String,
    })

    @SlashOption({
      name: 'silent',
      description: 'Should the command be only visible to you? (default: true)',
      required: false,
      type: ApplicationCommandOptionType.Boolean
    }) silent: boolean,

    interaction: CommandInteraction
  ): void {
    if(silent == undefined){
      silent = true
    }

    const timer = TimerList[searchText]
    if(timer == undefined){
      interaction.reply({
        content: `⛔ No timer with name '${searchText} found.`,
        ephemeral: true,
      })
    }

    if(timer.type === TimerType.stopwatch){
      const timeDiff = getTimeDifference(timer.startDate, DateTime.now())

      const replyContent = `${timeDiff} have elapsed since **${searchText}** (${getDiscordTimestamp(timer.endDate)})`

      interaction.reply({
        content: replyContent,
        ephemeral: silent
      })
      return
    }

    const timeDiff = getTimeDifference(DateTime.now(), timer.endDate)
    const rightNowDate = DateTime.now()

    const percentOne = timer.endDate.toMillis() - rightNowDate.toMillis()
    const percentTwo = timer.endDate.toMillis() - timer.startDate.toMillis()
    const rawPercent = percentOne / percentTwo

    const timePercentDiff = Math.round(rawPercent * 1000) / 10 

    const replyContent = `${timeDiff} remaining until **${searchText}** (${getDiscordTimestamp(timer.endDate)}). Only ${timePercentDiff}% remaining!`
    interaction.reply({
      content: replyContent,
      ephemeral: silent
    })
  }
}