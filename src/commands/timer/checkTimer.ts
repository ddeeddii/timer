import { ApplicationCommandOptionType, AutocompleteInteraction, CommandInteraction } from 'discord.js'
import { Discord, Slash, SlashGroup, SlashOption } from 'discordx'
import { DateTime } from 'luxon'
import { getTimeDifference } from '../../lib/common/dateUtils.js'
import { getAutocompleteTimerNames } from '../../lib/common/miscUtils.js'
import { TimerList } from '../../lib/dbHandler.js'
import { TimerType } from '../../lib/types.js'

@Discord()
@SlashGroup({ name: 'timer' })
export class TimerCheck {
  @Slash({ name: 'check', description: 'Check when a timer ends or how much time has elapsed' })
  @SlashGroup('timer')
  check(
    searchText: string,
    @SlashOption({
      autocomplete: (interaction: AutocompleteInteraction) => {
        const autocompleteData = getAutocompleteTimerNames(interaction.options.getFocused())

        interaction.respond(autocompleteData)
      },
      name: 'timer-name',
      type: ApplicationCommandOptionType.String,
    })
    
    interaction: CommandInteraction
  ): void {
    const timer = TimerList[searchText]
    if(timer == undefined){
      interaction.reply({
        content: `⛔ No timer with name '${searchText} found.`,
        ephemeral: true,
      })
    }

    const timerDT = DateTime.fromJSDate(timer.endDate)
    const timeString = timerDT.setLocale('en-ZA').toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY)

    if(timer.type === TimerType.stopwatch){
      const timeDiff = getTimeDifference(timer.startDate, new Date())

      const replyContent = `${timeDiff} have elapsed since **${searchText}** (${timeString})`

      interaction.reply({
        content: replyContent,
        ephemeral: true
      })
      return
    }

    const timeDiff = getTimeDifference(new Date(), timer.endDate)
    
    const rightNowDate = new Date()

    const percentOne = timer.endDate.getTime() - rightNowDate.getTime()
    const percentTwo = timer.endDate.getTime() - timer.startDate.getTime()
    const rawPercent = percentOne / percentTwo

    const timePercentDiff = Math.round(rawPercent * 1000) / 10 

    const replyContent = `${timeDiff} remaining until **${searchText}** (${timeString}). Only ${timePercentDiff}% remaining!`
    interaction.reply({
      content: replyContent,
      ephemeral: true
    })
  }
}