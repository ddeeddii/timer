import { ApplicationCommandOptionType, AutocompleteInteraction, CommandInteraction, PermissionFlagsBits } from 'discord.js'
import { Discord, Slash, SlashChoice, SlashGroup, SlashOption } from 'discordx'
import { syncDatabase, TimerList } from '../../lib/dbHandler.js'
import { getAutocomplete } from '../../lib/common/miscUtils.js'
import { DateTime } from 'luxon'

@Discord()
@SlashGroup({ name: 'timer' })
export class TimerSubscribe {
  @Slash({ name: 'reset', description: 'Reset a timer or its data' })
  @SlashGroup('timer')
  async reset(
    searchTimerName: string,
    @SlashOption({
      autocomplete: (interaction: AutocompleteInteraction) => {
        const autocompleteData = getAutocomplete(interaction.options.getFocused(), TimerList)

        interaction.respond(autocompleteData)
      },
      name: 'timer-name',
      type: ApplicationCommandOptionType.String,

    })

    option: string,
    @SlashOption({
      name: 'option',
      type: ApplicationCommandOptionType.String,
    })
    @SlashChoice({ name: 'Start date', value: 'start date' })
    @SlashChoice({ name: 'Notifications', value: 'notifications' })
    @SlashChoice({ name: 'Subscribers', value: 'subscribers' })

    silent: boolean,
    @SlashOption({
      name: 'silent',
      description: 'Should the command be only visible by you? (default: true)',
      required: false,
      type: ApplicationCommandOptionType.Boolean
    })

    interaction: CommandInteraction
  ): Promise<void> {



    const timer = TimerList[searchTimerName]

    if(timer == undefined){
      interaction.reply({
        content: `⛔ No timer with name '${searchTimerName} found.`,
        ephemeral: true,
      })
      return
    }
    
    const creatorId = timer.author
    const userId = interaction.user.id
    const guildMember = interaction.guild?.members.cache.get(interaction.user.id)
    if(guildMember?.permissions.has(PermissionFlagsBits.ManageMessages) == false && creatorId != userId){
      interaction.reply({
        content: `⛔ Insufficient permissions required to reset timers!`,
        ephemeral: true,
      })
      return
    }

    let reply = ''

    if(option == 'start date'){
      const rightNow = new Date()
      rightNow.setMilliseconds(0)
      rightNow.setSeconds(0)

      timer.startDate = rightNow

      const timerDT = DateTime.fromJSDate(rightNow)
      const timeString = timerDT.setLocale('en-ZA').toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY)
      reply = `Set **${searchTimerName}**'s start date to ${timeString}.`
    } else if(option == 'notifications') {
      timer.notifData = {}
      reply = `Removed all notification settings of '${searchTimerName}'.`
    } else if(option == 'subscribers'){
      timer.subscribers = []
      reply = `Removed all subscribers of '${searchTimerName}'.`
    } else {
      reply = '⛔ Incorrect option parameter!'
    }

    syncDatabase('/timers')
    interaction.reply({
      content: reply,
      ephemeral: silent
    })
  }
}