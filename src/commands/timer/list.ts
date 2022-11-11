import { ApplicationCommandOptionType, Colors, CommandInteraction, EmbedBuilder } from 'discord.js'
import { Discord, Slash, SlashGroup, SlashOption } from 'discordx'
import { Duration } from 'luxon'
import { toHuman } from '../../lib/common/dateUtils.js'
import { getDiscordTimestamp } from '../../lib/common/miscUtils.js'
import { TimerList } from '../../lib/dbHandler.js'
import { TimerType } from '../../lib/types.js'

const typeToString = {
  0: 'Stopwatch',
  1: 'Timer'
}

@Discord()
@SlashGroup({ name: 'timer', description: 'Timer'})

export class ListTimers {
  @Slash({ name: 'list', description: 'Display all timers and their data' })
  @SlashGroup('timer')
  list(
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
      const { type, startDate, endDate, author, subscribers, notifData, description, customText } = timerData

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

      const endDateShow = type == TimerType.standard ? `**End Date**: ${getDiscordTimestamp(endDate)}\n` : ''
      const descriptionShow = description == '' ? '' : `**Description**: ${description}\n`

      let hasCustomText = true
      if(customText.end == '' && customText.standard == ''){hasCustomText = false}

      const customNotifShow = hasCustomText == true ? '**Custom Notification Text**:\n' : ''
      const endCustomNotif = customText.end != '' ? `- **Timer End**: \`${customText.end}\`\n` : ''
      const standardCustomNotif = customText.standard != '' ? `- **Standard: **: \`${customText.standard}\`\n` : ''

      commandEmbed.addFields([
        {
          name: `**__${timerName}__**`,
          value: `${descriptionShow}`
          + `**Type**: ${typeToString[type]}\n`
          + `**Start Date**: ${getDiscordTimestamp(startDate)}\n`
          + `${endDateShow}`
          + `**Author**: <@${author}>\n`
          + `**Subscribers**: ${subscribersFormatted.join(', ')}\n`
          + `**Notifications**: ${notifDataFormatted.join('')}\n`
          + `${customNotifShow}`
          + `${endCustomNotif}`
          + `${standardCustomNotif}`
        }
      ])
    }

    interaction.reply({
      embeds: [commandEmbed],
      ephemeral: silent
    })
  }
}