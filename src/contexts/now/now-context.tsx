'use client'

import { createContext, use, useMemo } from 'react'

export type NowData = {
  now: Date
  year: number
  /** Month from 1 to 12 */
  month: number
  day: number
  daysInMonth: number
}

const NowContext = createContext<NowData | null>(null)

export function NowProvider({ children }: { children: React.ReactNode }) {
  const now = useMemo(() => new Date(), [])

  const value = useMemo(
    () => ({
      now,
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
      daysInMonth: new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate(),
    }),
    [now],
  )

  return <NowContext value={value}>{children}</NowContext>
}

export function useNow(): NowData {
  const ctx = use(NowContext)

  if (!ctx) {
    throw new Error('useTime must be used within a TimeProvider')
  }

  return ctx
}
