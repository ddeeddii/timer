import { ApplicationCommandOptionType, AutocompleteInteraction, CommandInteraction, PermissionFlagsBits } from 'discord.js'
import { Discord, Slash, SlashGroup, SlashOption } from 'discordx'
import { getAutocomplete } from '../../lib/common/miscUtils.js'
import { CounterList, syncDatabase } from '../../lib/dbHandler.js'

@Discord()
@SlashGroup({ name: 'counter' })
export class SetCounter {
  @Slash({ description: 'Add to counter' })
  @SlashGroup('counter')
  async set(
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
      description: 'Value the counter will be set to',
      name: 'value',
      type: ApplicationCommandOptionType.Number 
    })
    value: number,

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

    if(counter == undefined){ // does not exist
      interaction.reply({
        content: `⛔ No counter with name '${searchCounterName} found.`,
        ephemeral: true,
      })

      return
    }

    const creatorId = counter.author
    const userId = interaction.user.id
    const guildMember = interaction.guild?.members.cache.get(interaction.user.id)
    if(guildMember?.permissions.has(PermissionFlagsBits.ManageMessages) == false && creatorId != userId){
      interaction.reply({
        content: `⛔ Insufficient permissions to set a counter's value!`,
        ephemeral: true,
      })
      return
    }
    
    counter.value = value
    syncDatabase('/counters')

    interaction.reply({
      content: `Set **${searchCounterName}** to ${counter.value}.`,
      ephemeral: silent,
    })
  }
}
