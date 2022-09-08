import { ApplicationCommandOptionType, AutocompleteInteraction, CommandInteraction, PermissionFlagsBits, User } from 'discord.js'
import { Discord, Slash, SlashGroup, SlashOption } from 'discordx'
import { syncDatabaseToTimerList, TimerList } from '../../lib/dbHandler.js'
import { getAutocompleteTimerNames } from '../../lib/common/miscUtils.js'

@Discord()
@SlashGroup({ name: 'timer' })
export class TimerSubscribe {
  @Slash({ name: 'subscribe', description: 'Subscribe yourself or somebody to a timer and receive its notifications' })
  @SlashGroup('timer')
  async subscribe(
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
      name: 'user',
      type: ApplicationCommandOptionType.User,
      required: false,
    })
    mentionedUser: User,

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
    
    let user = interaction.user
    let replyUnsub = `Succesfully unsubscribed from **${searchTimerName}**!`
    let replySub = `Succesfully subscribed to **${searchTimerName}**!`

    if(mentionedUser != undefined){
      const guildMember = interaction.guild?.members.cache.get(user.id)

      if(guildMember?.permissions.has(PermissionFlagsBits.ModerateMembers) == false){
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
      syncDatabaseToTimerList()
  
      interaction.reply({
        content: replyUnsub,
        ephemeral: true,
      })
      return
    }

    timer.subscribers.push(user.id)
    syncDatabaseToTimerList()

    interaction.reply({
      content: replySub,
      ephemeral: true,
    })
  }
}