import { ApplicationCommandOptionType, CommandInteraction } from 'discord.js'
import { Discord, Slash, SlashGroup, SlashOption } from 'discordx'
import { CounterList, createNewCounter } from '../../lib/dbHandler.js'

@Discord()
@SlashGroup({ name: 'counter' })
export class NewCounter {
  @Slash({ description: 'Create a new counter' })
  @SlashGroup('counter')
  async create(
  @SlashOption({ 
      description: 'Counter name',
      name: 'name',
      type: ApplicationCommandOptionType.String 
    })
    name: string,

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

    if(CounterList[name] != undefined){ // counter already exists
      interaction.reply({
        content: '⛔ Counter name already taken!',
        ephemeral: true,
      })

      return
    }

    createNewCounter(name, interaction.user.id)
    interaction.reply({
      content: `Created a new counter named **${name}**!`,
      ephemeral: silent,
    })
  }
}
