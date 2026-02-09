import { CategoriesRepository, TransactionsRepository, UsersRepository } from '@/database'
import { AuthService, type JWTPaylaod } from '../auth'
import { Injector } from '../injector/injector'

import fromClass = Injector.fromClass
import factory = Injector.factory
import value = Injector.instance

import { DBTime } from '@/utils/time'

export type DependencyContainer = {
  repositories: {
    transactions: TransactionsRepository
    categories: CategoriesRepository
    users: UsersRepository
  }
  authService: AuthService
  userIdAsync: Promise<number | null>
  /** @deprecated Use requireAuth instead */
  jwtAsync: Promise<JWTPaylaod>
  requireAuth: () => Promise<JWTPaylaod>
  date: {
    year: number
    month: number
    day: number
    dbMonth: number
  }
}

export function buildDefaultContainer(): DependencyContainer {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const day = now.getDate()

  return Injector.container({
    repositories: {
      transactions: fromClass(TransactionsRepository),
      categories: fromClass(CategoriesRepository),
      users: fromClass(UsersRepository),
    },
    authService: fromClass(AuthService),
    userIdAsync: factory(async ({ authService }) => {
      const session = await authService.verifySession()
      return session?.id ?? null
    }),
    jwtAsync: factory(async ({ authService }) => {
      return await authService.requireAuth()
    }),
    requireAuth: factory(
      ({ authService }) =>
        () =>
          authService.requireAuth(),
    ),
    date: {
      year: value(year),
      month: value(month),
      day: value(day),
      dbMonth: factory(() => {
        return DBTime.fromYMToDB(year, month)
      }),
    },
  })
}
