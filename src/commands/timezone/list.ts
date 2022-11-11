import { ApplicationCommandOptionType, Colors, CommandInteraction, EmbedBuilder } from 'discord.js'
import { Discord, Slash, SlashGroup, SlashOption } from 'discordx'
import { DateTime } from 'luxon'
import { getDiscordTimestamp, parseTimezonesByOffset } from '../../lib/common/miscUtils.js'
import { TimezoneList } from '../../lib/dbHandler.js'

type parsedTimezoneInstance = [string, {timezone: string, users: Array<string>}]
function compareTimezones(a: parsedTimezoneInstance , b: parsedTimezoneInstance) {
  const aInt = parseInt(a[0])
  const bInt = parseInt(b[0])
  
  return aInt - bInt
}

@Discord()
@SlashGroup({ name: 'timezone', description: 'Timezone' })
export class ListTimezones {
  @Slash({ name: 'list', description: 'Display peoples timezones' })
  @SlashGroup('timezone')
  list(
    @SlashOption({
      name: 'date-time',
      description: `Format: 'yyyy/mm/dd hh:mm' (e.g. 2020/04/01 20:21)`,
      required: false,
      type: ApplicationCommandOptionType.String
    }) timeArg: string,

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

    if((interaction.user.id in TimezoneList) == false && timeArg != undefined ){      
      interaction.reply({
        content: '⛔ Cannot check a specific time if you dont have a timezone set!',
        ephemeral: true,
      })

      return
    }

    let defaultDate = DateTime.now()
    if(timeArg != undefined){
      const timezone = TimezoneList[interaction.user.id]
      const dateDT = DateTime.fromFormat(timeArg, 'yyyy/mm/dd hh:mm', {zone: timezone})

      if(dateDT.isValid){
        defaultDate = dateDT
      }
    }

    const mainEmbed = new EmbedBuilder()
    .setColor(Colors.Green)
    .setTitle(`${interaction.guild?.name} members' timezones`)
    .addFields([
      {
        name: '**Relative to**',
        value: `${getDiscordTimestamp(defaultDate)}`,
        inline: true
      }
    ])

    const parsedTimezones = parseTimezonesByOffset()
    const sortedTimezonesArray = Object.entries(parsedTimezones).sort(compareTimezones)
    
    for (const data of sortedTimezonesArray) {
      const offset = data[0]
      const { timezone, users } = data[1]
      
      const usersFormatted: Array<string> = []
      users.forEach((userId: string) => {
        usersFormatted.push(`<@${userId}>`)
      })

      const time = defaultDate.setZone(timezone)

      const intOffset = parseInt(offset) / 60
      const formattedOffset = intOffset >= 0 ? `UTC+${intOffset}` : `UTC${intOffset}`

      mainEmbed.addFields([
        {
          name:
          `**${time.toLocaleString(DateTime.TIME_24_SIMPLE)}**`
          +` ${time.setLocale('en-ZA').toLocaleString(DateTime.DATE_MED)} - ${formattedOffset}`,

          value: usersFormatted.join(', ')
        }
      ])
    }

    interaction.reply({
      embeds: [mainEmbed],
      ephemeral: silent
    })
  }
}