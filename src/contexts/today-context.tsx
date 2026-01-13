'use client'

import { createContext, type ReactNode, use } from 'react'

const TodayContext = createContext<Date | null>(null)

type Props = {
  today: Date
  children: ReactNode
}

export function TodayProvider({ children, today }: Props) {
  return <TodayContext value={today}>{children}</TodayContext>
}

export function useToday(): Date {
  const data = use(TodayContext)
  if (!data) {
    throw new Error('useToday must be used within a TodayProvider')
  }
  return data
}
