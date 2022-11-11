import { CronJob } from 'cron'
import chalk from 'chalk'
import { dbPaths, syncDatabase, TimerList } from './dbHandler.js'
import { TimerData, TimerType } from './types.js'
import { bot } from '../main.js'
import { DateTime, Duration } from 'luxon'
import { BaseGuildTextChannel } from 'discord.js'
import { getTimeDifference } from './common/dateUtils.js'
import { getDiscordTimestamp } from './common/miscUtils.js'

function getNotificationString(membersToNotify: Array<string>){
  const pings = membersToNotify.map(member => '<@' + member + '>')
  return pings.join(' ')
}

interface paramMap {
  [key: string]: string
}

function completeCustomNotification(name: string, timerData: TimerData, type: 'end' | 'standard'){
  const startDate = timerData.startDate.setLocale('en-ZA')
  const endDate = timerData.endDate.setLocale('en-ZA')
  const currentDate = DateTime.now().setLocale('en-ZA')

  const paramMap: paramMap = {
    '%name': name,
    '%desc': timerData.description,
    '%st': startDate.toLocaleString(DateTime.TIME_24_SIMPLE),
    '%sd': startDate.toLocaleString(DateTime.DATE_MED),
    '%swd': startDate.weekdayShort,
    '%et': endDate.toLocaleString(DateTime.TIME_24_SIMPLE),
    '%ed': endDate.toLocaleString(DateTime.DATE_MED),
    '%ewd': endDate.weekdayShort,
    '%ct': currentDate.toLocaleString(DateTime.TIME_24_SIMPLE),
    '%cd': currentDate.toLocaleString(DateTime.DATE_MED),
    '%cwd': currentDate.weekdayShort,
    '%te': getTimeDifference(timerData.startDate, DateTime.now()),
    '%tr': getTimeDifference(DateTime.now(), timerData.endDate),
  }
  
  const re = new RegExp(Object.keys(paramMap).join('|'), 'gi')
  const completedText = timerData.customText[type].replace(re, function(matched: string){
    return paramMap[matched]
  })

  return completedText
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
  const currentTime = DateTime.now()
  for (const [channelId, durationISO] of Object.entries(timerData.notifData)) {
    const channel = bot.channels.cache.get(channelId) as BaseGuildTextChannel
    const notification = getNotificationString(timerData.subscribers)

    if(durationISO == 'end'){
      if(currentTime.toMillis() >= timerData.endDate.toMillis()){
        if(timerData.customText.end != ''){
          const customText = completeCustomNotification(name, timerData, 'end')
          channel.send(customText + ` ${notification}`)
        } else {
          channel.send(`**${name}** is here! ${timerData.description} 🎉 ${notification}`)
        }
  
        delete TimerList[name]
        syncDatabase(dbPaths.timers)
      }

      return
    }

    const duration = Duration.fromISO(durationISO)
    const nextNotification = timerData.lastNotifDate.toMillis() + duration.toMillis()
    if(currentTime.toMillis() >= nextNotification){
      if(timerData.customText.standard != ''){
        const customText = completeCustomNotification(name, timerData, 'standard')
        channel.send(customText + ` ${notification}`)
      } else {
        const timeDiff = getTimeDifference(DateTime.now(), timerData.endDate)
    
        channel.send(`${timeDiff} remaining until **${name}**! (${getDiscordTimestamp(timerData.endDate)}). ${timerData.description} ${notification}`)
      }
    }
  }

}

function handleStopwatch(name: string, timerData: TimerData){
  const currentTime = DateTime.now()

  for (const [channelId, durationISO] of Object.entries(timerData.notifData)) {
    const duration = Duration.fromISO(durationISO)
    const nextNotification = timerData.lastNotifDate.toMillis() + duration.toMillis()
    
    if(currentTime.toMillis() > nextNotification){
      const channel = bot.channels.cache.get(channelId) as BaseGuildTextChannel
      if(channel?.isTextBased() == false){
        return
      }

      const notification = getNotificationString(timerData.subscribers)
      if(timerData.customText.standard != ''){
        const customText = completeCustomNotification(name, timerData, 'standard')
        channel.send(customText + ` ${notification}`)
      } else {
        const timeDiff = getTimeDifference(timerData.startDate, DateTime.now())
  
        channel.send(`${timeDiff} have elapsed since **${name}**! ${timerData.description} ${notification}`)
      }
      
      TimerList[name].lastNotifDate = currentTime
      syncDatabase(dbPaths.timers)
    }
  }
}

const schedulerJob = new CronJob('* * * * *', checkTimers) // runs every minute

export function initalizeScheduler(){
  console.log(chalk.blue('\nInitalizing CRON schedulers...'))

  schedulerJob.start()

  console.log(chalk.green('Scheduler initalized!'))
}
