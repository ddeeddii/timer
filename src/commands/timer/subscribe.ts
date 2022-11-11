import { ApplicationCommandOptionType, AutocompleteInteraction, CommandInteraction, PermissionFlagsBits, User } from 'discord.js'
import { Discord, Slash, SlashGroup, SlashOption } from 'discordx'
import { dbPaths, syncDatabase, TimerList } from '../../lib/dbHandler.js'
import { getAutocomplete } from '../../lib/common/miscUtils.js'

@Discord()
@SlashGroup({ name: 'timer', description: 'Timer'})

export class TimerSubscribe {
  @Slash({ name: 'subscribe', description: 'Subscribe yourself or somebody to a timer and receive its notifications' })
  @SlashGroup('timer')
  async subscribe(
    searchTimerName: string,
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
      name: 'user',
      description: 'Force subscribe a user',
      type: ApplicationCommandOptionType.User,
      required: false,
    })
    mentionedUser: User,

    @SlashOption({
      name: 'silent',
      description: 'Should the command be only visible to you? (default: true)',
      required: false,
      type: ApplicationCommandOptionType.Boolean
    })
    silent: boolean,

    interaction: CommandInteraction
  ): Promise<void> {
    if(silent == undefined){
      silent = true
    }

    const timer = TimerList[searchTimerName]

    if(timer == undefined){
      interaction.reply({
        content: `⛔ No timer with name '${searchTimerName} found.`,
        ephemeral: true,
      })
      return
    }
    
    let user = interaction.user
    let replyUnsub = `Succesfully unsubscribed from **${searchTimerName}**!`
    let replySub = `Succesfully subscribed to **${searchTimerName}**!`

    if(mentionedUser != undefined){
      const guildMember = interaction.guild?.members.cache.get(user.id)

      if(guildMember?.permissions.has(PermissionFlagsBits.KickMembers) == false){
        interaction.reply({
          content: `⛔ Insufficient permissions required to subscribe a member!`,
          ephemeral: true,
        })
        return
      }

      user = mentionedUser
      replyUnsub = `Succesfully unsubscribed <@${user.id}> from **${searchTimerName}**!`
      replySub = `Succesfully subscribed <@${user.id}> to **${searchTimerName}**!`

    }

    if(timer.subscribers.includes(user.id)){
      timer.subscribers.splice(timer.subscribers.indexOf(user.id), 1)
      syncDatabase(dbPaths.timers)
  
      interaction.reply({
        content: replyUnsub,
        ephemeral: silent,
      })
      return
    }

    timer.subscribers.push(user.id)
    syncDatabase(dbPaths.timers)

    interaction.reply({
      content: replySub,
      ephemeral: silent,
    })
  }
}