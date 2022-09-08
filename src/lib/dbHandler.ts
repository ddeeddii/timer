import { TimerListInterface, TimerType } from './types'
import chalk from 'chalk'

export const TimerList: TimerListInterface = {}

// Setup database
import { JsonDB, Config } from 'node-json-db'

const db = new JsonDB(new Config('db/db.json', true, true, '/'))
export async function initDatabase(){
	try {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const data = await db.getData('/timers') as Array<TimerListInterface>
  
		console.log(chalk.greenBright('\nDatabase found!'))

    await loadDatabase()
	} catch(error) {
		console.log(chalk.red('\nNo database found'))
		console.log('Initalizing database with current timers...')
    await db.push('/timers', TimerList)
	}
}

// Helpers
async function loadDatabase(){
  console.log(chalk.blue('Loading database into TimerList...'))

  const data = await db.getData('/timers') as TimerListInterface
  for (const [name, timerData] of Object.entries(data)) {
    TimerList[name] = timerData
  }

  console.log(chalk.greenBright('Loaded database into TimerList'))
}

// Sync tool export
export async function syncDatabaseToTimerList(){
  console.log(chalk.redBright('\nAttempting to sync database with TimerList..'))
  
  await db.push('/timers', TimerList, true)

  console.log(chalk.greenBright('\nSynchronised database to TimerList!'))
}

// Main export
export function addToTimerList(name: string, type: TimerType, date: Date, creator: string) {
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
  syncDatabaseToTimerList()
}