import { ApplicationCommandOptionType, Colors, CommandInteraction, EmbedBuilder, GuildMember } from 'discord.js'
import { Discord, Slash, SlashGroup, SlashOption } from 'discordx'
import { DateTime } from 'luxon'
import { getDiscordTimestamp } from '../../lib/common/miscUtils.js'
import { TimezoneList } from '../../lib/dbHandler.js'

@Discord()
@SlashGroup({ name: 'timezone', description: 'Timezone' })
export class ListTimezones {
  @Slash({ name: 'check', description: 'Display detailed information about someones timezone' })
  @SlashGroup('timezone')
  check(
    @SlashOption({
      name: 'user',
      description: 'Whose timezone information be displayed',
      type: ApplicationCommandOptionType.User,
      required: true,
    }) mentionedUser: GuildMember,

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

    if(!(mentionedUser.id in TimezoneList)){
      interaction.reply({
        content: '⛔ User does not have a timezone set!',
        ephemeral: true
      })
      return
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
      const dateDT = DateTime.fromFormat(timeArg, 'yyyy/mm/dd hh:mm', {zone: timezone}).minus( {months: 1} )
      // We subtract a month because fromFormat uses 0-indexed months
      if(dateDT.isValid){
        defaultDate = dateDT
      }
    }

    const mainEmbed = new EmbedBuilder()
    .setColor(Colors.Green)
    .setTitle(`*${mentionedUser.user.username}*'s timezone`)

    const timezone = TimezoneList[mentionedUser.id]
    const time = defaultDate.setZone(timezone).setLocale('en-ZA')

    const intOffset = time.offset / 60
    const formattedOffset = intOffset >= 0 ? `UTC+${intOffset}` : `UTC${intOffset}`

    mainEmbed.addFields([
      {
        name: `${getDiscordTimestamp(defaultDate)}`,
        value: `${time.toLocaleString(DateTime.DATETIME_MED)} in ${timezone}`
        + `\nOffset: ${formattedOffset}`
      }
    ])

    interaction.reply({
      embeds: [mainEmbed],
      ephemeral: silent
    })
  }
}
