import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['pt', 'en'],
  defaultLocale: 'pt',
  // Default locale (pt) stays unprefixed (/dashboard); other locales are
  // prefixed (/en/dashboard). Keeps existing plain links working for pt.
  localePrefix: 'as-needed',
})

export type Locale = (typeof routing.locales)[number]
