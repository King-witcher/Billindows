import {
  CategoriesRepository,
  MessagesRepository,
  TransactionsRepository,
  UsersRepository,
} from '@/lib/database'
import { AuthService, type JWTPaylaod } from '../auth'
import { Injector } from './injector'

import fromClass = Injector.fromClass
import factory = Injector.factory
import value = Injector.instance

import { DBTime } from '@/utils/time'
import { DbPool } from '../database/db'

export type DependencyContainer = {
  repositories: {
    transactions: TransactionsRepository
    categories: CategoriesRepository
    users: UsersRepository
    messages: MessagesRepository
  }
  db: DbPool
  authService: AuthService
  userIdAsync: Promise<number | null>
  /** @deprecated Use requireAuth instead */
  jwtAsync: Promise<JWTPaylaod>
  requireAuth: () => Promise<JWTPaylaod>
  date: {
    year: number
    /** Current month from 1 to 12 */
    month: number
    day: number
    daysInMonth: number
    /** @deprecated Use date.month instead */
    dbMonth: number
  }
}

export function buildDefaultContainer(): DependencyContainer {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const day = now.getDate()

  return Injector.container({
    repositories: {
      transactions: fromClass(TransactionsRepository),
      categories: fromClass(CategoriesRepository),
      users: fromClass(UsersRepository),
      messages: fromClass(MessagesRepository),
    },
    db: factory(() => DbPool.instance),
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
      daysInMonth: value(new Date(year, month, 0).getDate()),
      dbMonth: factory(() => {
        return DBTime.fromYMToDB(year, month)
      }),
    },
  })
}
