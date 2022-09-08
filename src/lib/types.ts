export enum TimerType {
  stopwatch,
  standard
}

export interface GlobalDataInterface {
  timers: TimerListInterface
  counters: CounterListInterface
}

export interface TimerListInterface {
  [name: string]: TimerData
}

export interface TimerData{
  type: TimerType,
  startDate: Date,
  endDate: Date, 
  lastNotifDate: Date,
  author: string,
  subscribers: Array<string>,
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