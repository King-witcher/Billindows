'use client'

import type { ReactNode } from 'react'

const WEEK_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

interface Props {
  day: number
  year: number
  month: number
  isToday: boolean
  children: ReactNode
}

export function DayGroup({ day, year, month, isToday, children }: Props) {
  const weekDay = new Date(year, month, day).getDay()

  return (
    <div className="flex flex-col gap-2">
      <div className="sticky top-0 z-10 flex items-center gap-2 0 px-1 py-1.5 backdrop-blur-sm">
        <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
          {day}
        </span>
        <div className="flex flex-col leading-none">
          <span className="text-xs font-medium text-muted-foreground">{WEEK_DAYS[weekDay]}</span>
          {isToday && <span className="text-[10px] font-semibold text-primary">Today</span>}
        </div>
        <div className="ml-2 h-px flex-1 border border-t-border border-b-white" />
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  )
}
