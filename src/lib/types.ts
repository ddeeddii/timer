import { DateTime } from 'luxon'

export enum TimerType {
  stopwatch,
  standard
}

export interface GlobalDataInterface {
  timers: TimerListInterface
  counters: CounterListInterface
  timezones: TimezoneListInterface
}

export interface TimerListInterface {
  [name: string]: TimerData
}

export interface customTextInterface {
  'end': string,
  'standard': string
}

export interface TimerData{
  type: TimerType,
  startDate: DateTime,
  endDate: DateTime, 
  lastNotifDate: DateTime,
  author: string,
  subscribers: Array<string>,
  description: string,
  customText: customTextInterface,
  timezone: string,
  notifData: {
    [channel: string]: string
  }
}

export interface CounterListInterface {
  [name: string]: CounterData
}

interface CounterData {
  author: string,
  value: number,
}

export enum dbPath {
  timers = '/timers',
  counters = '/counters',
  timezones = '/timezones'
}

export interface TimezoneListInterface {
  [user: string]: string
}