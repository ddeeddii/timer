import { ApplicationCommandOptionType, Colors, CommandInteraction, EmbedBuilder } from 'discord.js'
import { Discord, Slash, SlashGroup, SlashOption } from 'discordx'
import { CounterList } from '../../lib/dbHandler.js'

@Discord()
@SlashGroup({ name: 'counter' })
export class ListCounters {
  @Slash({ description: 'List all counters' })
  @SlashGroup('counter')
  async list(
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

    const commandEmbed = new EmbedBuilder()
    .setColor(Colors.Green)
    .setTitle('Counters')

    if(Object.keys(CounterList).length == 0) {
      commandEmbed.setDescription('No counters found! 😢')
      interaction.reply({
        embeds: [commandEmbed],
        ephemeral: silent
      })
      return
    }

    for (const [counterName, counterData] of Object.entries(CounterList)) {
      const { author, value } = counterData

      commandEmbed.addFields([
        {
          name: `**__${counterName}__**`,
          value: `**Value**: ${value}\n`
          + `**Author**: <@${author}>\n`
        }
      ])
    }

    interaction.reply({
      embeds: [ commandEmbed ],
      ephemeral: silent
    })
  }
}
