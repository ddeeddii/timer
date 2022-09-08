import { CounterListInterface, GlobalDataInterface, TimerListInterface, TimerType } from './types'
import chalk from 'chalk'

// Empty
const GlobalData: GlobalDataInterface = {
  timers: {},
  counters: {}
}

export const TimerList: TimerListInterface = {}
export const CounterList: CounterListInterface = {}

// Setup database
import { JsonDB, Config } from 'node-json-db'

const db = new JsonDB(new Config('db/db.json', true, true, '/'))
export async function initDatabase(){
	try {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const data = await db.getData('/data')
  
		console.log(chalk.greenBright('\nDatabase found!'))

    await loadDatabase()
	} catch(error) {
		console.log(chalk.red('\nNo database found'))
		console.log('Initalizing empty database...')
    await db.push('/data', GlobalData)
	}
}

// Helpers
async function loadDatabase(){
  console.log(chalk.blue('Loading database...'))

  const data = await db.getData('/data') as GlobalDataInterface

  for (const [name, timerData] of Object.entries(data.timers)) {
    TimerList[name] = timerData
  }

  for (const [name, counterData] of Object.entries(data.counters)) {
    CounterList[name] = counterData
  }

  console.log(chalk.greenBright('Loaded database!'))
}

// Sync tool export
export async function syncDatabase(dbPath: '/timers' | '/counters'){
  console.log(chalk.redBright('\nAttempting to sync database...'))

  let dbVar
  if(dbPath == '/timers'){
    dbVar = TimerList
  } else if(dbPath == '/counters'){
    dbVar = CounterList
  } else {
    console.log(chalk.redBright(`SYNCHRONISATION ERROR: WRONG DBPATH ${dbPath}`))
    return
  }
  
  await db.push('/data' + dbPath, dbVar, true)

  console.log(chalk.greenBright('\nSynchronised database!'))
}

// Main exports
export function createNewTimer(name: string, type: TimerType, date: Date, creator: string) {
  const rightNow = new Date()
  rightNow.setMilliseconds(0)
  rightNow.setSeconds(0)

  const timer = {
    type: type,
    startDate: rightNow,
    endDate: date,
    lastNotifDate: rightNow,
    author: creator,
    subscribers: [creator],
    notifData: {},
  }

  TimerList[name] = timer
  syncDatabase('/timers')
}

export function createNewCounter(name: string, creator: string) {
  const counter = {
    author: creator,
    value: 0
  }

  CounterList[name] = counter
  syncDatabase('/counters')
}