import { type NextRequest, NextResponse } from 'next/server'
import { verifySession } from './lib/session'

const protectedRoutes = ['/', '/dashboard', '/categories', '/transactions']

export async function middleware(request: NextRequest) {
  if (protectedRoutes.includes(request.nextUrl.pathname)) {
    const session = await verifySession()

    if (!session) {
      const url = new URL('/sign-in', request.nextUrl)
      url.searchParams.set('referrer', request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }

    if (request.nextUrl.pathname === '/')
      return NextResponse.redirect(new URL('/dashboard', request.nextUrl))
  }
}
