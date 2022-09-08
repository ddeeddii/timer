export enum TimerType {
  stopwatch,
  standard
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