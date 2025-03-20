import { NextResponse, type NextRequest } from 'next/server'
import { verifySession } from './lib/session'

const protectedRoutes = ['/']

export async function middleware(request: NextRequest) {
  if (protectedRoutes.includes(request.nextUrl.pathname)) {
    const session = await verifySession()

    if (!session) {
      const url = new URL('/sign-in', request.nextUrl)
      url.searchParams.set('referrer', request.nextUrl.pathname)
      console.log(request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }
  }
}
