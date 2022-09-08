import { CommandInteraction, ButtonBuilder, ButtonStyle, ActionRowBuilder, MessageActionRowComponentBuilder } from 'discord.js'
import { currentTimerData } from '../../commands/timer/startTimer.js'

export async function createStopwatch(interaction: CommandInteraction){
  await interaction.deferReply({
    ephemeral: true
  })

  const confirmNewStopwatchButton = new ButtonBuilder()
    .setLabel('Yes')
    .setStyle(ButtonStyle.Success)
    .setCustomId('confirm-stopwatch-btn')

  const denyNewStopwatchButton = new ButtonBuilder()
    .setLabel('No')
    .setStyle(ButtonStyle.Danger)
    .setCustomId('deny-stopwatch-btn')

  const row =
    new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
      confirmNewStopwatchButton,
      denyNewStopwatchButton
    )

  currentTimerData.row = row
  currentTimerData.content = `Create a **stopwatch** timer?`

  interaction.editReply({
    components: [row],
    content: currentTimerData.content,
  })
}

export async function createTimer(name: string, interaction: CommandInteraction, date: Date){
  await interaction.deferReply({
    ephemeral: true
  })

  const confirmTimerButton = new ButtonBuilder()
    .setLabel('Yes')
    .setStyle(ButtonStyle.Success)
    .setCustomId('confirm-timer-btn')

  const denyTimerButton = new ButtonBuilder()
    .setLabel('No')
    .setStyle(ButtonStyle.Danger)
    .setCustomId('deny-timer-btn')

  const row =
    new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
      confirmTimerButton,
      denyTimerButton
    )

  currentTimerData.row = row

  const dateLiteral = date.toLocaleDateString('en-ZA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false
  })

  const dateSimple = date.toLocaleDateString('en-ZA')
  currentTimerData.content = `Create a date timer '**${name}**' for **${dateLiteral}** (${dateSimple})?`

  interaction.editReply({
    components: [row],
    content:  currentTimerData.content,
  })
}
