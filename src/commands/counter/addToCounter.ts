import { ApplicationCommandOptionType, AutocompleteInteraction, CommandInteraction, PermissionFlagsBits } from 'discord.js'
import { Discord, Slash, SlashGroup, SlashOption } from 'discordx'
import { getAutocomplete } from '../../lib/common/miscUtils.js'
import { CounterList, dbPaths, syncDatabase } from '../../lib/dbHandler.js'

@Discord()
@SlashGroup({ name: 'counter', description: 'Counter', })
export class AddCounter {
  @Slash({ description: 'Add to counter' })
  @SlashGroup('counter')
  async add(
    searchCounterName: string,
    @SlashOption({
      autocomplete: (interaction: AutocompleteInteraction) => {
        const autocompleteData = getAutocomplete(interaction.options.getFocused(), CounterList)

        interaction.respond(autocompleteData)
      },

      name: 'counter-name',
      description: 'Name of the counter',
      required: true,
      type: ApplicationCommandOptionType.String,
    })

    @SlashOption({ 
      description: 'Value that will be added to the counter',
      name: 'value',
      required: true,
      type: ApplicationCommandOptionType.Number 
    })
    value: number,

    @SlashOption({
      name: 'silent',
      description: 'Should the command be only visible to you? (default: true)',
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
        content: `⛔ Insufficient permissions to add value to a counter!`,
        ephemeral: true,
      })
      return
    }
    
    counter.value += value
    syncDatabase(dbPaths.counters)

    interaction.reply({
      content: `Added ${value} to counter **${searchCounterName}**. It now has a value of ${counter.value}`,
      ephemeral: silent,
    })
  }
}
