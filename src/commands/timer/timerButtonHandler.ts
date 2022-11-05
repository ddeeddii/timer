import { ActionRowBuilder, ButtonInteraction, CommandInteraction, MessageActionRowComponentBuilder } from 'discord.js'
import { ButtonComponent, Discord } from 'discordx'
import { createNewTimer } from '../../lib/dbHandler.js'
import { TimerType } from '../../lib/types.js'
import { currentTimerData } from './startTimer.js'

function disableInteractionButtons(
  interaction: CommandInteraction,
  row: ActionRowBuilder<MessageActionRowComponentBuilder>,
  content: string  
){
  row.components[0].setDisabled(true)
  row.components[1].setDisabled(true)

  interaction.editReply({
    components: [row],
    content: content
  })
}

@Discord()
export class TimerButtons {
  @ButtonComponent({ id: 'confirm-stopwatch-btn' })
  confirmNewStopwatchButton(btnInteraction: ButtonInteraction): void {
    const {name, content, interaction, row, description} = currentTimerData
    disableInteractionButtons(interaction, row, content)

    const commandAuthorId = interaction.member?.user.id

    // because stopwatch's date is undefined and
    // we need to get when the timer was created
    const rightNowDate = new Date()
    createNewTimer(name, TimerType.stopwatch, rightNowDate, commandAuthorId as string, description)
    
    btnInteraction.reply({
      content: `Created a **stopwatch** timer!`,
      ephemeral: true
    })
  }

  @ButtonComponent({ id: 'deny-stopwatch-btn' })
  denyNewStopwatchButton(btnInteraction: ButtonInteraction): void {
    const {content, interaction, row} = currentTimerData
    disableInteractionButtons(interaction, row, content)

    btnInteraction.reply({
      content: `Cancelled timer creation.`,
      ephemeral: true
    })
  }

  @ButtonComponent({ id: 'confirm-timer-btn' })
  confirmNewTimerButton(btnInteraction: ButtonInteraction): void {
    const {name, date, content, interaction, row, description} = currentTimerData
    disableInteractionButtons(interaction, row, content)

    const commandAuthorId = interaction.member?.user.id
    const channel = interaction.channel
    const initNotifData = channel == undefined ? {} : {[channel.id]: 'end'}
    createNewTimer(name, TimerType.standard, date, commandAuthorId as string, description, initNotifData)

    btnInteraction.reply({
      content: `Created date timer '**${currentTimerData.name}**'!`,
      ephemeral: true
    })
  }

  @ButtonComponent({ id: 'deny-timer-btn' })
  denyNewTimerButton(btnInteraction: ButtonInteraction): void {
    const {content, interaction, row,} = currentTimerData
    disableInteractionButtons(interaction, row, content)

    btnInteraction.reply({
      content: `Cancelled timer creation.`,
      ephemeral: true
    })
  }
}