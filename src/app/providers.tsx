import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import type { ReactNode } from 'react'
import { NowProvider } from '@/contexts/now/now-context'
import { TodayProvider } from '@/contexts/today-context'
import { queryClient } from '@/lib/query-client'

interface Props {
  children: ReactNode
}

export function Providers({ children }: Props) {
  return (
    <QueryClientProvider client={queryClient}>
      <TodayProvider today={new Date()}>
        <NowProvider>{children}</NowProvider>
      </TodayProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
