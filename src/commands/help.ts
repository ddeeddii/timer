import { ApplicationCommandOptionType, CommandInteraction, EmbedBuilder } from 'discord.js'
import { Discord, Slash, SlashChoice, SlashOption } from 'discordx'

@Discord()
export class help {
  @Slash({ name: 'help', description: 'Display help about timers/counters' })
  help(
    help: string,
    @SlashOption({
      name: 'option',
      description: 'Which element of the bot do you need help with',
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    @SlashChoice({ name: 'General', value: 'general' })
    @SlashChoice({ name: 'Timer', value: 'timer' })
    @SlashChoice({ name: 'Counter', value: 'counter' })
    @SlashChoice({ name: 'Timezone', value: 'timezone' })
    @SlashChoice({ name: 'Custom Notifications', value: 'custom-notif' })

    silent: boolean,
    @SlashOption({
      name: 'silent',
      description: 'Should the command be only visible to you? (default: true)',
      required: false,
      type: ApplicationCommandOptionType.Boolean
    })

    interaction: CommandInteraction
  ): void {
    if(silent == undefined){
      silent = true
    }

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
        value: `**start** creates a new Timer. Date arguments are optional; if provided - creates a timer, if empty - creates a stopwatch.\n`
        + '**check** displays information depending on Timer type; stopwatch - elapsed time, timer - end date, % left\n'
        + '**subscribe** you will be pinged when the timer sends out a notification\n'
        + '**list** lists all timers and its data\n'
        },

        {
          name: '**__Timer creator__**',
          value: '**reset** resets a Timer or some of its data\n'
          + '**remove** remove a Timer\n'
          + `**custom-notif** set custom notification text. See /help Custom Notifications for more details.`
        },

        {
          name: '**__Moderators__**',
          value: '**notify** periodically send out notifications about timer in selected channel. If the Timer is of type "timer" and no arguments have been provided, the notification will fire when the timer ends\n'
          + '\nEvery timer automatically sends out a notification in the channel where it was created when it ends\n'
          + '*Moderators also have unrestricted access to modify Timers and can force-subscribe people to Timers*'
        },
    ])
    } else if(help == 'counter'){
      embed = new EmbedBuilder()
      .setTitle('Counter Commands')
      .setFooter({text: 'Made with ❤ by ded'})
      .addFields([
        {
          name: '**__Information__**',
          value: 'Every command has a silent argument (true by default). If set to true, everybody will see the command'
        },

        {
        name: '**__Everyone__**',
        value: '**create** creates a new Counter.\n'
        + '**check** displays who created the Counter, and its value\n'
        + '**list** lists all counters and its data\n'
        },

        {
          name: '**__Counter creator__**',
          value: '**add** add a number to a Counter\n'
          + "**set** set a Counter's value\n"
          + '**remove** remove a Counter'
        },

        {
          name: '**__Moderators__**',
          value: 'Moderators have unrestricted access to modify Counters'
        },
    ])
    } else if(help == 'custom-notif') {
      embed = new EmbedBuilder()
      .setTitle('Create Timer')
      .setFooter({text: 'Made with ❤ by ded'})
      .addFields([
        {
          name: '**__Information__**',
          value: 'This command is used to create custom notification text.\n'
          + 'Special parameters can be used to add custom data into the text.\n'
          + 'At the end of the custom text, the pings will be added.'
        },
        {
          name: '**__Standard parameters__**',
          value: '**Default timer end text:** `%name is here! %desc 🎉` \n\n'
          + `**%name** The timer's name\n`
          + `**%desc** The timer's description\n`
          + `**%st** Start time of the timer\n`
          + `**%sd** Start date of the timer\n`
          + `**%swd** Day of the week of the timer start\n`
          + '**%et** End time of the timer (*timer only*)\n'
          + '**%ed** End date of the timer (*timer only*)\n'
          + '**%ewd** Day of the week of the timer end (*timer only*)\n'
          + '**%ct** Current time\n'
          + '**%cd** Current date\n'
          + '**%cwd** Current day of the week\n'

        },
        {
          name: '**__Timer notification only parameters__**',
          value: '**Default Timer text:** `%tr remaining until %name! (%ewd, %ed, %et). %desc`\n'
          + '**Default Stopwatch text:** `%te have elapsed since %name. %desc`\n\n'
          + '**%te** Time elapsed since timer start (e.g 9 hours, 5 minutes, 21 seconds)\n'
          + '**%tr** Time until timer end (e.g 10 days, 10 hours, 5 minutes, 59 seconds) *timer only*\n'

        }
      ])
    } else if(help == 'timezone'){
      embed = new EmbedBuilder()
      .setTitle('Timezone Commands')
      .setFooter({text: 'Made with ❤ by ded'})
      .addFields([
        {
          name: '**__Everyone__**',
          value: '**set** Set your timezone, in compliance with IANA timezones. Simply fill "timezone" out with your country\'s capital\n'
          + `**list** Displays the current time of everyone who has set a timezone\n`
          + `**check** Displays the current time of a particular user or time in a particular time zone`
        },
        {
          name: '**__Moderators__**',
          value: 'Moderators with "Kick user" permissions can set other people\'s timezones'
        },
      ])
    } else if(help == 'general'){
      embed = new EmbedBuilder()
      .setTitle('General')
      .setFooter({text: 'Made with ❤ by ded'})
      .addFields([
        {
          name: '**__License__**',
          value: 'This bot is free and open source under the GPL-2.0 license\n'
          + 'You can find the source code here: <https://github.com/ddeeddii/timer>'
        },
        {
          name: '**__Bot Owner__**',
          value: '**setpresence** Set the bot\'s status and activity\n'
        },
      ])
    } else { 
      interaction.reply({
        content: '⛔ Invalid argument!',
        ephemeral: true
      })
      return
    }

    interaction.reply({
      embeds: [embed],
      ephemeral: silent
    })
  }
}