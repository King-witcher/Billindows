import { type NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { type Locale, routing } from './i18n/routing'
import { AuthService } from './lib/auth'

const intlMiddleware = createMiddleware(routing)

// Logical (locale-stripped) routes that require an authenticated session.
const protectedRoutes = ['/', '/dashboard', '/categories', '/transactions']

/** Splits a pathname into its locale and the locale-stripped logical path. */
function splitLocale(pathname: string): { locale: Locale; path: string } {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length > 0 && routing.locales.includes(segments[0] as Locale)) {
    return { locale: segments[0] as Locale, path: `/${segments.slice(1).join('/')}` }
  }
  return { locale: routing.defaultLocale, path: pathname }
}

/** Builds a locale-aware absolute URL (default locale stays unprefixed). */
function localizedUrl(path: string, locale: Locale, base: URL): URL {
  const prefix = locale === routing.defaultLocale ? '' : `/${locale}`
  return new URL(`${prefix}${path}`, base)
}

export async function middleware(request: NextRequest) {
  const { locale, path } = splitLocale(request.nextUrl.pathname)

  if (protectedRoutes.includes(path)) {
    const session = await new AuthService().verifySession()

    if (!session) {
      const loginUrl = localizedUrl('/login', locale, request.nextUrl)
      loginUrl.searchParams.set('referrer', path)
      return NextResponse.redirect(loginUrl)
    }

    if (path === '/') {
      return NextResponse.redirect(localizedUrl('/dashboard', locale, request.nextUrl))
    }
  }

  return intlMiddleware(request)
}

export const config = {
  // Run on everything except Next internals, the API and files with an extension.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
