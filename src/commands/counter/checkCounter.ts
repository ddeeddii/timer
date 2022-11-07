import { ApplicationCommandOptionType, AutocompleteInteraction, CommandInteraction } from 'discord.js'
import { Discord, Slash, SlashGroup, SlashOption } from 'discordx'
import { getAutocomplete } from '../../lib/common/miscUtils.js'
import { CounterList } from '../../lib/dbHandler.js'

@Discord()
@SlashGroup({ name: 'counter', description: 'Counter', })
export class CheckCounter {
  @Slash({ description: "Check a counter's value" })
  @SlashGroup('counter')
  async check(
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
    
    interaction.reply({
      content: `**${searchCounterName}**: ${counter.value}`,
      ephemeral: silent,
    })
  }
}
