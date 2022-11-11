import { ActionRowBuilder, ApplicationCommandOptionType, CommandInteraction, MessageActionRowComponentBuilder } from 'discord.js'
import { Discord, Slash, SlashGroup, SlashOption } from 'discordx'
import { DateTime } from 'luxon'
import { createStopwatch, createTimer } from '../../lib/common/startTimerUtils.js'
import { TimerList, TimezoneList } from '../../lib/dbHandler.js'

export const currentTimerData = {
  name: '',
  date: DateTime.now(),
  content: '',
  interaction: undefined as unknown as CommandInteraction,
  row: undefined as unknown as ActionRowBuilder<MessageActionRowComponentBuilder>,
  description: ''
}


@Discord()
@SlashGroup({ name: 'timer', description: 'Timer'})

export class TimerStart {
  @Slash({ description: 'Create a new timer' })
  @SlashGroup('timer')
  async start(
    @SlashOption({ description: 'Timer name', name: 'name', required: true, type: ApplicationCommandOptionType.String }) name: string,
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

    if(!(interaction.user.id in TimezoneList)){      
      interaction.reply({
        content: '⛔ Cannot create timers if you dont have a timezone set!',
        ephemeral: true,
      })

      return
    }
    const timezone = TimezoneList[interaction.user.id]
    const date = DateTime.fromObject({year: year, month: month, day: day, hour: hour, minute: minute}, { zone: timezone })

    if(description == undefined){
      description = ''
    }

    currentTimerData.name = name
    currentTimerData.date = date
    currentTimerData.interaction = interaction
    currentTimerData.description = description

    const jsDate = new Date(year, month - 1, day, hour, minute)
    const dateSimple = jsDate.toLocaleDateString('en-ZA')
    if(dateSimple == 'Invalid Date'){
      createStopwatch(interaction, name, description)
      return
    }
 
    const right_now = DateTime.now()
    if(date.toMillis() < right_now.toMillis()){
      interaction.reply({
        content: '⛔ Cannot create timers to the past!',
        ephemeral: true,
      })

      return
    }

    createTimer(name, interaction, date, description)
  }
}
