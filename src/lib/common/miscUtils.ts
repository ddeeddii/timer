import { ApplicationCommandOptionChoiceData } from 'discord.js'
import { CounterListInterface, TimerListInterface } from '../types.js'

export function getAutocomplete(searchedString: string, object: TimerListInterface | CounterListInterface): Array<ApplicationCommandOptionChoiceData> {
  const allNames = Object.keys(object)
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