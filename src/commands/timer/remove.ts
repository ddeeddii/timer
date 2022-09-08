import { ApplicationCommandOptionType, AutocompleteInteraction, CommandInteraction, PermissionFlagsBits } from 'discord.js'
import { Discord, Slash, SlashGroup, SlashOption } from 'discordx'
import { syncDatabaseToTimerList, TimerList } from '../../lib/dbHandler.js'
import { getAutocompleteTimerNames } from '../../lib/common/miscUtils.js'

@Discord()
@SlashGroup({ name: 'timer' })
export class TimerSubscribe {
  @Slash({ name: 'remove', description: 'Delete a timer' })
  @SlashGroup('timer')
  async remove(
    searchTimerName: string,
    @SlashOption({
      autocomplete: (interaction: AutocompleteInteraction) => {
        const autocompleteData = getAutocompleteTimerNames(interaction.options.getFocused())

        interaction.respond(autocompleteData)
      },
      name: 'timer-name',
      type: ApplicationCommandOptionType.String,

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
    if(guildMember?.permissions.has(PermissionFlagsBits.ManageGuild) == false && creatorId != userId){
      interaction.reply({
        content: `⛔ Insufficient permissions to remove a timer!`,
        ephemeral: true,
      })
      return
    }

    delete TimerList[searchTimerName]

    syncDatabaseToTimerList()
    interaction.reply({
      content: `Removed timer '${searchTimerName}'.`,
      ephemeral: true
    })
  }
}