import { ApplicationCommandOptionType, AutocompleteInteraction, CommandInteraction, PermissionFlagsBits } from 'discord.js'
import { Discord, Slash, SlashGroup, SlashOption } from 'discordx'
import { getAutocomplete } from '../../lib/common/miscUtils.js'
import { CounterList, syncDatabase } from '../../lib/dbHandler.js'

@Discord()
@SlashGroup({ name: 'counter' })
export class RemoveCounter {
  @Slash({ description: 'Remove a counter' })
  @SlashGroup('counter')
  async remove(
    searchCounterName: string,
    @SlashOption({
      autocomplete: (interaction: AutocompleteInteraction) => {
        const autocompleteData = getAutocomplete(interaction.options.getFocused(), CounterList)

        interaction.respond(autocompleteData)
      },
      name: 'counter-name',
      type: ApplicationCommandOptionType.String,
    })

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

    const counter = CounterList[searchCounterName]

    if(counter == undefined){ // counter doesnt exist
      interaction.reply({
        content: '⛔ Counter name already taken!',
        ephemeral: true,
      })

      return
    }

    const creatorId = counter.author
    const userId = interaction.user.id
    const guildMember = interaction.guild?.members.cache.get(interaction.user.id)
    if(guildMember?.permissions.has(PermissionFlagsBits.ManageMessages) == false && creatorId != userId){
      interaction.reply({
        content: `⛔ Insufficient permissions to remove a counter!`,
        ephemeral: true,
      })
      return
    }

    delete CounterList[searchCounterName]
    syncDatabase('/counters')

    interaction.reply({
      content: `Removed counter '${searchCounterName}'.`,
      ephemeral: silent
    })
  }
}
