import { ApplicationCommandOptionType, Colors, CommandInteraction, EmbedBuilder } from 'discord.js'
import { Discord, Slash, SlashGroup, SlashOption } from 'discordx'
import { DateTime, Duration } from 'luxon'
import { toHuman } from '../../lib/common/dateUtils.js'
import { TimerList } from '../../lib/dbHandler.js'
import { TimerType } from '../../lib/types.js'

const typeToString = {
  0: 'Stopwatch',
  1: 'Timer'
}

@Discord()
@SlashGroup({ name: 'timer' })
export class ListTimers {
  @Slash({ name: 'list', description: 'Display all timers and their data' })
  @SlashGroup('timer')
  list(
    @SlashOption({
      name: 'silent',
      description: 'Should the command be only visible by you? (default: true)',
      required: false,
      type: ApplicationCommandOptionType.Boolean
    }) silent: boolean,

    interaction: CommandInteraction
  ): void {
    if(silent == undefined){
      silent = true
    }

    const commandEmbed = new EmbedBuilder()
    .setColor(Colors.Green)
    .setTitle('Timers')

    if(Object.keys(TimerList).length == 0) {
      commandEmbed.setDescription('No timers found! 😢')
      interaction.reply({
        embeds: [commandEmbed],
        ephemeral: silent
      })
      return
    }

    for (const [timerName, timerData] of Object.entries(TimerList)) {
      const { type, startDate, endDate, author, subscribers, notifData } = timerData

      const startDateDT = DateTime.fromJSDate(startDate)
      const startDateString = startDateDT.setLocale('en-ZA').toLocaleString(DateTime.DATETIME_MED)

      const endDateDT = DateTime.fromJSDate(endDate)
      const endDateString = endDateDT.setLocale('en-ZA').toLocaleString(DateTime.DATETIME_MED)

      const subscribersFormatted: Array<string> = []
      subscribers.forEach((subscriber) => {
        subscribersFormatted.push(`<@${subscriber}>`)
      })
      
      const notifDataFormatted: Array<string> = [] 
      for (const [channel, period] of Object.entries(notifData)) {
        if(period == 'end') {
          notifDataFormatted.push(`\n<#${channel}>: Timer end`)
          continue
        }

        const durationString = toHuman(Duration.fromISO(period), 'minutes')

        notifDataFormatted.push(`\n<#${channel}>: ${durationString}`)
      }

      const endDateShow = type == TimerType.standard ? `**End Date**: ${endDateString}\n` : ''

      commandEmbed.addFields([
        {
          name: `**__${timerName}__**`,
          value: `**Type**: ${typeToString[type]}\n`
          + `**Start Date**: ${startDateString}\n`
          + `${endDateShow}`
          + `**Author**: <@${author}>\n`
          + `**Subscribers**: ${subscribersFormatted.join(', ')}\n`
          + `**Notifications**: ${notifDataFormatted.join('')}`
        }
      ])
    }

    interaction.reply({
      embeds: [commandEmbed],
      ephemeral: silent
    })
  }
}