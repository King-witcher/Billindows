'use client'

import { type Updater, useQuery, useQueryClient } from '@tanstack/react-query'
import { useUser } from '@/contexts/user-context'
import type { AbstractTransaction } from '@/lib/database/types'
import { listTransactionsAction } from './action'

export function useTransactions(year: number, month: number) {
  const user = useUser()
  const client = useQueryClient()
  const queryKey = ['transactions', user.email, year, month]
  const query = useQuery({
    queryKey: queryKey,
    queryFn: () => listTransactionsAction({ filter: { year, month } }),
  })

  function setData(updater: Updater<AbstractTransaction[] | undefined, AbstractTransaction[]>) {
    client.setQueryData<AbstractTransaction[]>(queryKey, updater)
  }

  return {
    ...query,
    setData,
  }
}
