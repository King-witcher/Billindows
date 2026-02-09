import { cookies } from 'next/headers'

const COOKIE_NAME = 'session'

/** @deprecated */
export type JWTPaylaod = {
  id: number
  name: string
  email: string
  role: 'user'
}

/** @deprecated */
export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}
