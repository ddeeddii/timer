import { CounterListInterface, GlobalDataInterface, TimerListInterface, TimerType, TimezoneListInterface } from './types'
import chalk from 'chalk'

// Empty
const GlobalData: GlobalDataInterface = {
  timers: {},
  counters: {},
  timezones: {},
}

export const TimerList: TimerListInterface = {}
export const CounterList: CounterListInterface = {}
export const TimezoneList: TimezoneListInterface = {}

// Setup database
import { JsonDB, Config } from 'node-json-db'
import { DateTime } from 'luxon'
import { assert } from 'console'

const db = new JsonDB(new Config('db/db.json', true, true, '/'))
export async function initDatabase(){
	try {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const data = await db.getData('/data')
  
		console.log(chalk.greenBright('\nDatabase found!'))

    await loadDatabase()
	} catch(error) {
    console.log(error)
  
		console.log(chalk.red('\nNo database found'))
		console.log('Initalizing empty database...')
    await db.push('/data', GlobalData)
	}
}

// Helpers
async function loadDatabase(){
  console.log(chalk.blue('Loading database...'))

  const data = await db.getData('/data') as GlobalDataInterface

  for (const [name, timerData] of Object.entries(data.timers)){
    TimerList[name] = timerData

    // node-json-db improperly saves DateTime objects as Dates, without timezones
    // This makes them DateTimes again, and re-adds timezones
    const timezone = timerData.timezone
    TimerList[name].startDate = DateTime.fromJSDate(timerData.startDate as unknown as Date).setZone(timezone)
    TimerList[name].endDate = DateTime.fromJSDate(timerData.endDate as unknown as Date).setZone(timezone)
    TimerList[name].lastNotifDate = DateTime.fromJSDate(timerData.lastNotifDate as unknown as Date).setZone(timezone)
  }

  for (const [name, counterData] of Object.entries(data.counters)) {
    CounterList[name] = counterData
  }

  for (const [userId, userTimezone] of Object.entries(data.timezones)) {
    TimezoneList[userId] = userTimezone
  }

  console.log(chalk.greenBright('Loaded database!'))
}

// Sync tool export
export enum dbPaths {
  timers = '/timers',
  counters = '/counters',
  timezones = '/timezones'
}
const dbPathToVar = {
  [dbPaths.timers]: TimerList,
  [dbPaths.counters]: CounterList,
  [dbPaths.timezones]: TimezoneList,
}

export async function syncDatabase(dbPath: dbPaths){
  console.log(chalk.redBright('\nAttempting to sync database...'))

  await db.push('/data' + dbPath, dbPathToVar[dbPath], true)

  console.log(chalk.greenBright('\nSynchronised database!'))
}

// Main exports
export function createNewTimer(name: string, type: TimerType, date: DateTime, creator: string, description = '', notifData = {}) {
  const timezone = TimezoneList[creator]

  const rightNow = DateTime.now().setZone(timezone)
  rightNow.set({millisecond: 0, second: 0})

  assert(date.zoneName === timezone)
  const timer = {
    type: type,
    startDate: rightNow,
    endDate: date,
    lastNotifDate: rightNow,
    author: creator,
    subscribers: [creator],
    description: description,
    notifData: notifData,
    timezone: timezone,
    customText: {
      'end': '',
      'standard': ''
    }
  }

  TimerList[name] = timer
  syncDatabase(dbPaths.timers)
}

export function createNewCounter(name: string, creator: string) {
  const counter = {
    author: creator,
    value: 0
  }

  CounterList[name] = counter
  syncDatabase(dbPaths.counters)
}

export function addUserTimezone(userId: string, timezone: string) {
  TimezoneList[userId] = timezone
  syncDatabase(dbPaths.timezones)
}