import { ApplicationCommandOptionType, Colors, CommandInteraction, EmbedBuilder } from 'discord.js'
import { Discord, Slash, SlashGroup, SlashOption } from 'discordx'
import { CounterList } from '../../lib/dbHandler.js'

@Discord()
@SlashGroup({ name: 'counter', description: 'Counter' })
export class ListCounters {
  @Slash({ description: 'List all counters' })
  @SlashGroup('counter')
  async list(
    @SlashOption({
      name: 'page',
      description: 'Page number. 10 counters per page',
      required: false,
      type: ApplicationCommandOptionType.Number
    }) page: number,

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

    const amtCounters = Object.keys(CounterList).length
    if(page == undefined){
      page = 1
    }

    const maxPages = Math.ceil(amtCounters / 10)
    const commandEmbed = new EmbedBuilder()
    .setColor(Colors.Green)
    .setTitle(amtCounters <= 10 ? 'Counters' : `Counters (page ${page}/${maxPages})`)
    
    if(amtCounters == 0) {
      commandEmbed.setDescription('No counters found! 😢')
      interaction.reply({
        embeds: [commandEmbed],
        ephemeral: silent
      })
      return
    }

    if(page > maxPages){
      interaction.reply({
        content: `⛔ Page ${page} does not exist! (Highest page is ${maxPages})`,
        ephemeral: true,
      })
      return
    }

    let currentTimerIdx = 0
    let pageIdx = 1
    for (const [counterName, counterData] of Object.entries(CounterList)) {
      currentTimerIdx += 1
      if(currentTimerIdx > 10){
        pageIdx += 1
      }

      if(pageIdx != page){
        continue
      }

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
