import { jwtVerify, SignJWT } from 'jose'
import { cookies } from 'next/headers'
import type { UUID_v7 } from '../database/types/postgres'
import { fail } from '../server-wrappers/errors'

const COOKIE_NAME = 'session'
const COOKIE_LIFESPAN = 1000 * 60 * 60 * 24 // 1 day

export type JWTPaylaod = {
  id: UUID_v7
  name: string
  email: string
  role: 'user'
}

export class AuthService {
  private readonly key = new TextEncoder().encode(process.env.JWT_SECRET)
  private readonly cookieStore = cookies()

  async createSession(payload: JWTPaylaod) {
    const expires = new Date(Date.now() + COOKIE_LIFESPAN)
    const session = await this.encryptJWT(payload)

    const cookieStore = await this.cookieStore
    cookieStore.set(COOKIE_NAME, session, {
      expires,
      secure: true,
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    })
  }

  async verifySession(): Promise<JWTPaylaod | null> {
    // TODO: check if JWT is invalidated on server side
    const cookieStore = await this.cookieStore
    const cookie = cookieStore.get(COOKIE_NAME)?.value
    if (!cookie) return null

    const session = await this.decryptJWT(cookie)
    return session
  }

  async deleteSession(): Promise<void> {
    // TODO: invalidate JWT on server side
    const cookieStore = await this.cookieStore
    cookieStore.delete(COOKIE_NAME)
  }

  async requireAuth(): Promise<JWTPaylaod> {
    const session = await this.verifySession()
    if (!session) fail('unauthenticated')
    return session
  }

  private async encryptJWT(payload: JWTPaylaod): Promise<string> {
    return new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1day')
      .sign(this.key)
  }

  private async decryptJWT(session: string): Promise<JWTPaylaod | null> {
    try {
      const { payload } = await jwtVerify(session, this.key, {
        algorithms: ['HS256'],
      })
      return payload as JWTPaylaod
    } catch (error) {
      console.error('Failed to verify JWT:', error)
      return null
    }
  }
}
