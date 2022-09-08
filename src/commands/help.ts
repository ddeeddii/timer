import { ApplicationCommandOptionType, CommandInteraction, EmbedBuilder } from 'discord.js'
import { Discord, Slash, SlashChoice, SlashOption } from 'discordx'

@Discord()
export class TimerCheck {
  @Slash({ name: 'help', description: 'Display help about timers/counters' })
  help(
    help: string,
    @SlashOption({
      name: 'option',
      type: ApplicationCommandOptionType.String,
    })
    @SlashChoice({ name: 'Timer', value: 'timer' })
    @SlashChoice({ name: 'Counter', value: 'counter' })

    interaction: CommandInteraction
  ): void {
    let embed

    if(help == 'timer'){
      embed = new EmbedBuilder()
      .setTitle('Timer Commands')
      .setFooter({text: 'Made with ❤ by ded'})
      .addFields([
        {
          name: '**__Information__**',
          value: 'Timers have two types - timer and stopwatch\n'
          + 'Every command has a silent argument (true by default). If set to true, everybody will see the command'
        },

        {
        name: '**__Everyone__**',
        value: '**start** creates a new Timer. Date arguments are optional; if provided - creates a timer, if empty - creates a stopwatch\n'
        + '**check** displays information depending on Timer type; stopwatch - elapsed time, timer - end date, % left\n'
        + '**subscribe** you will be pinged when the timer sends out a notification\n'
        + '**list** lists all timers and some of its data\n'
        + '**help** display help about either Timers or Counters'
        },

        {
          name: '**__Timer creator__**',
          value: '**reset** resets a Timer or some of its data\n'
          + '**remove** remove a Timer\n'
        },

        {
          name: '**__Moderators__**',
          value: '**notify** periodically send out notifications about timer in selected channel. If the Timer is of type "timer" and no arguments have been provided, the notification will fire when the timer ends\n'
          + '*Moderators also have unrestricted access to modify Timers and can force-subscribe people to Timers*'
        },
    ])
    } else if(help == 'counter'){
      embed = new EmbedBuilder()
    } else { 
      interaction.reply({
        content: '⛔ Invalid argument!',
        ephemeral: true
      })
      return
    }

    interaction.reply({
      embeds: [embed],
      ephemeral: true
    })
  }
}