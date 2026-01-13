import { Paper } from '@mui/material'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { verifySession } from '@/lib/session'

interface Props {
  children: ReactNode
}

export default async function Layout(props: Props) {
  const session = await verifySession()
  if (session) redirect('/')

  return (
    <div className="w-dvw h-dvh flex items-center justify-center p-[20px]">
      <Paper className="p-[40px] w-[380px] max-w-full flex flex-col gap-[20px] items-center">
        {props.children}
      </Paper>
    </div>
  )
}
