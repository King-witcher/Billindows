import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import type { Metadata } from 'next'
import { Roboto } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const roboto = Roboto({
  variable: '--font-roboto',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Billindows',
  description: 'Manage and preview your finances.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en-US">
      <Analytics />
      <SpeedInsights />
      <body className={`${roboto.variable} antialiased bg-gray-100`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
