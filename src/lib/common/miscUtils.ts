import { ApplicationCommandOptionChoiceData } from 'discord.js'
import { DateTime } from 'luxon'
import { TimezoneList } from '../dbHandler.js'
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

// Temporary fix for Intl.supportedValuesOf not being in typescript
// Read https://github.com/microsoft/TypeScript/issues/49231
// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Intl {
  type Key = 'calendar' | 'collation' | 'currency' | 'numberingSystem' | 'timeZone' | 'unit';

  function supportedValuesOf(input: Key): string[];
}

export const supportedTimezones = Intl.supportedValuesOf('timeZone')

export function getTimezoneAutocomplete(searchedString: string){
  const allTimezones = Intl.supportedValuesOf('timeZone')

  let filteredTimezones
  if(searchedString == ''){
    filteredTimezones = allTimezones
  } else {
    filteredTimezones = allTimezones.filter(
      // .toLowerCase() makes it case insensitive
      name => name.toLowerCase().includes(searchedString.toLowerCase())
    )
  }

  const formattedTimezones: Array<ApplicationCommandOptionChoiceData> = []
  filteredTimezones.forEach((name) => {
    formattedTimezones.push({name: name, value: name})
  })

  return formattedTimezones.slice(0, 5)
}

export interface timezoneObj {
  [offset: string]: {
    timezone: string,
    users: Array<string>
  }
}

export function parseTimezonesByOffset(): timezoneObj{
  const timezoneObj: timezoneObj = {}

  for (const [userId, timezone] of Object.entries(TimezoneList)) {
    const offset = DateTime.now().setZone(timezone).offset

    if(offset in timezoneObj){
      timezoneObj[offset].users.push(userId)
    } else {
      timezoneObj[offset] = {
        timezone: timezone,
        users: [userId]
      }
    }
  }

  return timezoneObj
}

export function getDiscordTimestamp(date: DateTime, symbol = 'f'){
  return `<t:${Math.floor(date.toSeconds())}:${symbol}>`
}