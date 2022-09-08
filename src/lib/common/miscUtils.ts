import { ApplicationCommandOptionChoiceData } from 'discord.js'
import { TimerList } from '../dbHandler.js'

export function getAutocompleteTimerNames(searchedString: string): Array<ApplicationCommandOptionChoiceData> {
  const allNames = Object.keys(TimerList)

  const formattedNames: Array<ApplicationCommandOptionChoiceData> = []

  let filteredNames
  if(searchedString == ''){
    filteredNames = allNames
  } else {
    filteredNames = allNames.filter(name => name.includes(searchedString))
  }
  filteredNames.forEach((name) => {
    formattedNames.push({name: name, value: name})
  })

  return formattedNames
}