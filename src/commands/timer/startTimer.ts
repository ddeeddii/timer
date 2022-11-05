import { ActionRowBuilder, ApplicationCommandOptionType, CommandInteraction, MessageActionRowComponentBuilder } from 'discord.js'
import { Discord, Slash, SlashGroup, SlashOption } from 'discordx'
import { createStopwatch, createTimer } from '../../lib/common/startTimerUtils.js'
import { TimerList } from '../../lib/dbHandler.js'

export const currentTimerData = {
  name: '',
  date: new Date(),
  content: '',
  interaction: undefined as unknown as CommandInteraction,
  row: undefined as unknown as ActionRowBuilder<MessageActionRowComponentBuilder>,
  description: ''
}


@Discord()
@SlashGroup({ name: 'timer' })
export class TimerStart {
  @Slash({ description: 'Create a new timer' })
  @SlashGroup('timer')
  async start(
    @SlashOption({ description: 'Timer name', name: 'name', type: ApplicationCommandOptionType.String }) name: string,
    @SlashOption({ description: 'Additional text', name: 'description', required: false, type: ApplicationCommandOptionType.String }) description: string,
    @SlashOption({ description: 'Ending year', name: 'year', required: false, type: ApplicationCommandOptionType.Number }) year: number,
    @SlashOption({ description: 'Ending month', name: 'month', required: false, type: ApplicationCommandOptionType.Number }) month: number,
    @SlashOption({ description: 'Ending day', name: 'day', required: false, type: ApplicationCommandOptionType.Number }) day: number,
    @SlashOption({ description: 'Ending hour', name: 'hour', required: false, type: ApplicationCommandOptionType.Number }) hour: number,
    @SlashOption({ description: 'Ending minute', name: 'minute', required: false, type: ApplicationCommandOptionType.Number }) minute: number,

    interaction: CommandInteraction
  ): Promise<void> {

    if(TimerList[name] != undefined){ // timer with the same name already exists
      interaction.reply({
        content: '⛔ Timer name already taken!',
        ephemeral: true,
      })

      return
    }

    const date = new Date(year, month - 1, day, hour, minute)
    const dateSimple = date.toLocaleDateString('en-ZA')

    const right_now = new Date().getTime()
    if(date.getTime() < right_now){
      interaction.reply({
        content: '⛔ Cannot create timers to the past!',
        ephemeral: true,
      })

      return
    }

    if(description == undefined){
      description = ''
    }

    currentTimerData.name = name
    currentTimerData.date = date
    currentTimerData.interaction = interaction
    currentTimerData.description = description

    if(dateSimple === 'Invalid Date'){
      createStopwatch(interaction, name, description)
      return
    }

    createTimer(name, interaction, date, description)
  }
}
