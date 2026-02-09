import { jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const key = new TextEncoder().encode(process.env.JWT_SECRET)
const COOKIE_NAME = 'session'

/** @deprecated */
export type JWTPaylaod = {
  id: number
  name: string
  email: string
  role: 'user'
}

async function decryptJWT(session: string): Promise<JWTPaylaod | null> {
  try {
    const { payload } = await jwtVerify(session, key, {
      algorithms: ['HS256'],
    })
    return payload as JWTPaylaod
  } catch (error) {
    return null
  }
}

/** @deprecated */
export async function verifySession(): Promise<JWTPaylaod | null> {
  const cookieStore = await cookies()
  const cookie = cookieStore.get(COOKIE_NAME)?.value
  if (!cookie) return null

  const session = await decryptJWT(cookie)
  return session
}

/** @deprecated */
export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}
