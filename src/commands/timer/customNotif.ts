import { ApplicationCommandOptionType, AutocompleteInteraction, CommandInteraction, PermissionFlagsBits } from 'discord.js'
import { Discord, Slash, SlashChoice, SlashGroup, SlashOption } from 'discordx'
import { dbPaths, syncDatabase, TimerList } from '../../lib/dbHandler.js'
import { getAutocomplete } from '../../lib/common/miscUtils.js'
import { TimerType } from '../../lib/types.js'

enum notificationType {
  timerEnd = 'end',
  standard = 'standard',
}

@Discord()
@SlashGroup({ name: 'timer' })
export class CustomNotify {
  @Slash({ name:'custom-notify', description: 'Set custom notification text'})
  @SlashGroup('timer')
  async notify(
    searchTimerName: string,
    @SlashOption({
      autocomplete: (interaction: AutocompleteInteraction) => {
        const autocompleteData = getAutocomplete(interaction.options.getFocused(), TimerList)

        interaction.respond(autocompleteData)
      },
      name: 'timer-name',
      type: ApplicationCommandOptionType.String,

    })
  
    @SlashOption({
      type: ApplicationCommandOptionType.String,
      description: 'Custom text',
      name: 'text',
      required: true })
    text: string,
    
    type: 'end' | 'standard',
    @SlashOption({
      name: 'notification-type',
      type: ApplicationCommandOptionType.String,
    })
    @SlashChoice({ name: 'On timer end', value: 'end' })
    @SlashChoice({ name: 'Standard notification', value: 'standard' })

    @SlashOption({
      name: 'silent',
      description: 'Should the command be only visible by you? (default: true)',
      required: false,
      type: ApplicationCommandOptionType.Boolean
    }) silent: boolean,
  
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

    const creatorId = timer.author
    const userId = interaction.user.id
    const guildMember = interaction.guild?.members.cache.get(interaction.user.id)
    if(guildMember?.permissions.has(PermissionFlagsBits.ManageMessages) == false && creatorId != userId){
      interaction.reply({
        content: `⛔ Insufficient permissions to set a timer's custom notification text!`,
        ephemeral: true,
      })
      return
    }

    if(timer.type == TimerType.stopwatch && type == notificationType.timerEnd) {
      interaction.reply({
        content: `⛔ Cannot set timer end notification on a stopwatch timer!`,
        ephemeral: true,
      })
      return
    }

    if(timer.type == TimerType.stopwatch){
      if(text.includes('%et') || text.includes('%ed') || text.includes('%edw') || text.includes('%tr')){
        interaction.reply({
          content: `⛔ Cannot use timer-only parameter on a stopwatch timer!`,
          ephemeral: true,
        })
        return
      }
    }

    if(type == notificationType.timerEnd){
      if(text.includes('%tr') || text.includes('%te')){
        interaction.reply({
          content: `⛔ Cannot use on notification only parameter on timer end!`,
          ephemeral: true,
        })
        return
      }
    }

    timer.customText[type] = text
    syncDatabase(dbPaths.timers)

    interaction.reply({
      content: `Set **${searchTimerName}**'s notification text to \`${text}\``,
      ephemeral: silent,
    })
  }
}