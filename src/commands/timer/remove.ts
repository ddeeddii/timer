import { ApplicationCommandOptionType, AutocompleteInteraction, CommandInteraction, PermissionFlagsBits } from 'discord.js'
import { Discord, Slash, SlashGroup, SlashOption } from 'discordx'
import { dbPaths, syncDatabase, TimerList } from '../../lib/dbHandler.js'
import { getAutocomplete } from '../../lib/common/miscUtils.js'

@Discord()
@SlashGroup({ name: 'timer', description: 'Timer'})

export class TimerRemove {
  @Slash({ name: 'remove', description: 'Delete a timer' })
  @SlashGroup('timer')
  async remove(
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
    
    const creatorId = timer.author
    const userId = interaction.user.id
    const guildMember = interaction.guild?.members.cache.get(interaction.user.id)
    if(guildMember?.permissions.has(PermissionFlagsBits.ManageMessages) == false && creatorId != userId){
      interaction.reply({
        content: `⛔ Insufficient permissions to remove a timer!`,
        ephemeral: true,
      })
      return
    }

    delete TimerList[searchTimerName]

    syncDatabase(dbPaths.timers)
    interaction.reply({
      content: `Removed timer '${searchTimerName}'.`,
      ephemeral: silent
    })
  }
}