import { CommandInteraction, ButtonBuilder, ButtonStyle, ActionRowBuilder, MessageActionRowComponentBuilder } from 'discord.js'
import { currentTimerData } from '../../commands/timer/startTimer.js'

export async function createStopwatch(interaction: CommandInteraction, name: string, description: string){
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
  if(description != ''){
    currentTimerData.content = `Create a **stopwatch** timer '**${name}**' with description '**${description}**'`
  }
  currentTimerData.content = `Create a **stopwatch** timer '**${name}**'?`

  interaction.editReply({
    components: [row],
    content: currentTimerData.content,
  })
}

export async function createTimer(name: string, interaction: CommandInteraction, date: Date, description: string){
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
  if(description != ''){
    currentTimerData.content = `Create a date timer '**${name}**' for **${dateLiteral}** (${dateSimple}) with description '**${description}?**`
  }

  currentTimerData.content = `Create a date timer '**${name}**' for **${dateLiteral}** (${dateSimple})?`

  interaction.editReply({
    components: [row],
    content:  currentTimerData.content,
  })
}
