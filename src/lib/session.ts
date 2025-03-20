import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const key = new TextEncoder().encode(process.env.JWT_SECRET)
const COOKIE_NAME = 'session'

export type JWTPaylaod = {
  id: string
  name: string
  email: string
  role: 'user'
}

export async function encryptJWT(payload: JWTPaylaod) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1day')
    .sign(key)
}

export async function decryptJWT(session: string): Promise<JWTPaylaod | null> {
  try {
    const { payload } = await jwtVerify(session, key, {
      algorithms: ['HS256'],
    })
    return payload as JWTPaylaod
  } catch (error) {
    return null
  }
}

export async function createSession(payload: JWTPaylaod) {
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24)
  const session = await encryptJWT(payload)

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, session, {
    expires,
    secure: true,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  })
}

export async function verifySession(): Promise<JWTPaylaod | null> {
  const cookieStore = await cookies()
  const cookie = cookieStore.get(COOKIE_NAME)?.value
  if (!cookie) return null

  const session = await decryptJWT(cookie)
  return session
}

export async function requireAuth(): Promise<void> {
  const session = await verifySession()
  if (!session) redirect('/login')
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}
