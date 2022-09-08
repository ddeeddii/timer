import { CronJob } from 'cron'
import chalk from 'chalk'
import { syncDatabaseToTimerList, TimerList } from './dbHandler.js'
import { TimerData, TimerType } from './types.js'
import { bot } from '../main.js'
import { DateTime, Duration } from 'luxon'
import { BaseGuildTextChannel } from 'discord.js'
import { getTimeDifference } from './common/dateUtils.js'

function getNotificationString(membersToNotify: Array<string>){
  const pings = membersToNotify.map(member => '<@' + member + '>')
  return pings.join(' ')
}

// checks all timers if they are ended and if they should be notified
function checkTimers(){  
  for (const [name, timerData] of Object.entries(TimerList)) {
    if(timerData.type == TimerType.standard){
      handleTimer(name, timerData)
    } else {
      handleStopwatch(name, timerData)
    }
  }
}

function handleTimer(name: string, timerData: TimerData){
  const currentTime = new Date()
  for (const [channelId, durationISO] of Object.entries(timerData.notifData)) {
    const channel = bot.channels.cache.get(channelId) as BaseGuildTextChannel
    const notification = getNotificationString(timerData.subscribers)

    if(durationISO == 'end'){
      if(currentTime.getTime() >= timerData.endDate.getTime()){
        channel.send(`**${name}** is here! 🎉 ${notification}`)
  
        delete TimerList[name]
        syncDatabaseToTimerList()
      }

      return
    }

    const duration = Duration.fromISO(durationISO)
    const nextNotification = timerData.lastNotifDate.getTime() + duration.toMillis()
    if(currentTime.getTime() >= nextNotification){
      const timerDT = DateTime.fromJSDate(timerData.endDate)
      const timeString = timerDT.setLocale('en-ZA').toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY)
 
      const timeDiff = getTimeDifference(new Date(), timerData.endDate)
    
      const rightNowDate = new Date()
  
      const percentOne = timerData.endDate.getTime() - rightNowDate.getTime()
      const percentTwo = timerData.endDate.getTime() - timerData.startDate.getTime()
      const rawPercent = percentOne / percentTwo
  
      const timePercentDiff = Math.round(rawPercent * 1000) / 10 
  
      channel.send(`${timeDiff} remaining until **${name}** (${timeString}). Only ${timePercentDiff}% remaining! ${notification}`)
    }
  }

}

function handleStopwatch(name: string, timerData: TimerData){
  const currentTime = new Date()

  for (const [channelId, durationISO] of Object.entries(timerData.notifData)) {
    const duration = Duration.fromISO(durationISO)
    const nextNotification = timerData.lastNotifDate.getTime() + duration.toMillis()
    
    if(currentTime.getTime() > nextNotification){
      const channel = bot.channels.cache.get(channelId) as BaseGuildTextChannel
      if(channel?.isTextBased() == false){
        return
      }

      const timeDiff = getTimeDifference(timerData.startDate, new Date())
      const notification = getNotificationString(timerData.subscribers)

      channel.send(`${timeDiff} have elapsed since **${name}**! ${notification}`)
      
      TimerList[name].lastNotifDate = currentTime
      syncDatabaseToTimerList()
    }
  }
}

const schedulerJob = new CronJob('* * * * *', checkTimers) // runs every minute

export function initalizeScheduler(){
  console.log(chalk.blue('\nInitalizing CRON schedulers...'))

  schedulerJob.start()

  console.log(chalk.green('Scheduler initalized!'))
}
