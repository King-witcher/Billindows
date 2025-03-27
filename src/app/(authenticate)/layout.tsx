import { verifySession } from '@/lib/session'
import { Paper } from '@mui/material'
import { redirect } from 'next/navigation'
import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  params: Promise<{ referrer: string }>
}

export default async function Layout(props: Props) {
  const session = await verifySession()
  const seacrhParams = await props.params
  const referrer = seacrhParams.referrer ?? '/'

  if (session) redirect(referrer)

  return (
    <div className="w-dvw h-dvh flex items-center justify-center p-[20px]">
      <Paper className="p-[40px] w-[380px] max-w-full flex flex-col gap-[20px] items-center">
        {props.children}
      </Paper>
    </div>
  )
}
