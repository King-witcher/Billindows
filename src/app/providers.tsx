import { ThemeProvider } from '@mui/material/styles'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter'
import { QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { NowProvider } from '@/contexts/now/now-context'
import { TodayProvider } from '@/contexts/today-context'
import { queryClient } from '@/lib/query-client'
import { theme } from '@/lib/theme'

interface Props {
  children: ReactNode
}

export function Providers({ children }: Props) {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRouterCacheProvider>
        <TodayProvider today={new Date()}>
          <ThemeProvider theme={theme}>
            <NowProvider>{children}</NowProvider>
          </ThemeProvider>
        </TodayProvider>
      </AppRouterCacheProvider>
    </QueryClientProvider>
  )
}
