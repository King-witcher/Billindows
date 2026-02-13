import { type NextRequest, NextResponse } from 'next/server'
import { AuthService } from './lib/auth'

const protectedRoutes = ['/', '/dashboard', '/categories', '/transactions']

export async function middleware(request: NextRequest) {
  if (protectedRoutes.includes(request.nextUrl.pathname)) {
    const authService = new AuthService()
    const session = await authService.verifySession()
    if (!session) {
      const url = new URL('/login', request.nextUrl)
      url.searchParams.set('referrer', request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }
    if (request.nextUrl.pathname === '/')
      return NextResponse.redirect(new URL('/dashboard', request.nextUrl))
  }
}
