import { ApplicationCommandOptionType, AutocompleteInteraction, Channel, ChannelType, CommandInteraction, PermissionFlagsBits } from 'discord.js'
import { Discord, Slash, SlashGroup, SlashOption } from 'discordx'
import { syncDatabaseToTimerList, TimerList } from '../../lib/dbHandler.js'
import { getAutocompleteTimerNames } from '../../lib/common/miscUtils.js'
import { DateTime, Duration } from 'luxon'
import { toHuman } from '../../lib/common/dateUtils.js'
import { TimerType } from '../../lib/types.js'

@Discord()
@SlashGroup({ name: 'timer' })
export class TimerNotify {
  @Slash({ name:'notify', description: 'Set periodic notifications to a channel' })
  @SlashGroup('timer')
  async notify(
    searchTimerName: string,
    @SlashOption({
      autocomplete: (interaction: AutocompleteInteraction) => {
        const autocompleteData = getAutocompleteTimerNames(interaction.options.getFocused())

        interaction.respond(autocompleteData)
      },
      name: 'timer-name',
      type: ApplicationCommandOptionType.String,

    })
  
    @SlashOption({
      type: ApplicationCommandOptionType.Channel,
      channelTypes: [ChannelType.GuildText, ChannelType.GuildNews],
      description: 'Channel where the notifications will be sent',
      name: 'channel',
      required: true })
    channel: Channel,

    @SlashOption({
      description: 'Notify every x days',
      name: 'days',
      required: false ,
      type: ApplicationCommandOptionType.Number
    }) 
    days: number,

    @SlashOption({
      description: 'Notify every x hours',
      name: 'hours',
      required: false,
      type: ApplicationCommandOptionType.Number
    }) 
    hours: number,

    @SlashOption({
      description: 'Notify every x minutes',
      name: 'minutes',
      required: false,
      type: ApplicationCommandOptionType.Number
    }) 
    minutes: number,
  
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

    if(days == undefined && hours == undefined && minutes == undefined){
      if(timer.type == TimerType.standard) {
        let content
        const channelsWithNotifications = Object.keys(timer.notifData)
    
        if(channelsWithNotifications.includes(channel.id)){
          content = `Overwritten ${searchTimerName}'s notifications in ${channel.toString()}. It will now trigger when the timer ends.`
        } else {
          content = `Added notification to ${channel.toString()} that will trigger when the timer ends.`
        }

        timer.notifData[channel.id] = 'end'
        syncDatabaseToTimerList()

        interaction.reply({
          content: content,
          ephemeral: true,
        })
        return
      }

      interaction.reply({
        content: `⛔ Incorrect / missing notification timing arguments!`,
        ephemeral: true,
      })
      return
    }

    const guildMember = interaction.guild?.members.cache.get(interaction.user.id)
    if(guildMember?.permissions.has(PermissionFlagsBits.ManageChannels) == false){
      interaction.reply({
        content: `⛔ Insufficient permissions required to set notifications!`,
        ephemeral: true,
      })
      return
    }

    let content

    const timing = Duration.fromObject({days: days, hours: hours, minutes: minutes})

    const nextNotification = DateTime.fromJSDate(new Date).plus(timing).setLocale('en-ZA').toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY)
    const channelsWithNotifications = Object.keys(timer.notifData)
    
    if(channelsWithNotifications.includes(channel.id)){
      content = `Overwritten ${searchTimerName}'s notifications in ${channel.toString()}. They will now trigger every ${toHuman(timing)} (next time on ${nextNotification})`
    } else {
      content = `Added notification to ${channel.toString()} that will trigger every ${toHuman(timing)} (next time on ${nextNotification})`
    }

    timer.notifData[channel.id] = timing.toISO()
    syncDatabaseToTimerList()

    interaction.reply({
      content: content,
      ephemeral: true,
    })
  }
}
