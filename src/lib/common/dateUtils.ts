import { DateTime, Duration } from 'luxon'

// read https://github.com/moment/luxon/issues/1134
export function toHuman(dur: Duration, smallestUnit = 'seconds'): string {
  const units = ['years', 'months', 'days', 'hours', 'minutes', 'seconds', 'milliseconds', ]
  const smallestIdx = units.indexOf(smallestUnit)
  const entries = Object.entries(
     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
     // @ts-ignore
    dur.shiftTo(...units).normalize().toObject()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ).filter(([_unit, amount], idx) => amount > 0 && idx <= smallestIdx)
  const dur2 = Duration.fromObject(
    entries.length === 0 ? { [smallestUnit]: 0 } : Object.fromEntries(entries),
    {locale: 'en-ZA'}
  )
  return dur2.toHuman()
}

export function getTimeDifference(startDate: DateTime, endDate: DateTime, smallestUnit = 'seconds'){
  const start = startDate.setLocale('en-ZA')
  const end = endDate.setLocale('en-ZA')

  const dryDiff = end.diff(start)
  if(dryDiff.hours > 1){
    smallestUnit = 'minutes'
  }

  const diff = toHuman(end.diff(start), smallestUnit)
  return diff
}
