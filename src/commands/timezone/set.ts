import { ApplicationCommandOptionType, AutocompleteInteraction, CommandInteraction, PermissionFlagsBits, User } from 'discord.js'
import { Discord, Slash, SlashGroup, SlashOption } from 'discordx'
import { getTimezoneAutocomplete, supportedTimezones } from '../../lib/common/miscUtils.js'
import { addUserTimezone } from '../../lib/dbHandler.js'

@Discord()
@SlashGroup({ name: 'timezone', description: 'Timezone' })
export class SetTimezone {
  @Slash({ description: 'Set your (or someone\'s) timezone' })
  @SlashGroup('timezone')
  async set(
    searchedTimezone: string,
    @SlashOption({
      autocomplete: (interaction: AutocompleteInteraction) => {
        const autocompleteData = getTimezoneAutocomplete(interaction.options.getFocused())
        interaction.respond(autocompleteData)
      },

      name: 'timezone',
      description: 'Timezone you want to use',
      required: true,
      type: ApplicationCommandOptionType.String,
    })

    @SlashOption({
      name: 'user',
      description: 'Force subscribe a user',
      type: ApplicationCommandOptionType.User,
      required: false,
    })
    mentionedUser: User,

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

    if(!supportedTimezones.includes(searchedTimezone)){
      interaction.reply({
        content: `⛔ No timezone called ${searchedTimezone}!`,
        ephemeral: silent,
      })
      return
    }

    let user = interaction.user
    let reply = `Successfully set your timezone to **${searchedTimezone}**!`
    if(mentionedUser != undefined){
      const guildMember = interaction.guild?.members.cache.get(user.id)

      if(guildMember?.permissions.has(PermissionFlagsBits.KickMembers) == false){
        interaction.reply({
          content: `⛔ Insufficient permissions required to set someone's timezone!`,
          ephemeral: true,
        })
        return
      }

      user = mentionedUser
      reply = `Succesfully set <@${user.id}>'s timezone to **${searchedTimezone}**!`
    }

    addUserTimezone(user.id, searchedTimezone)

    interaction.reply({
      content: reply,
      ephemeral: silent,
    })
  }
}
