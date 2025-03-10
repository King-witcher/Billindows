import { deleteSession, verifySession } from '@/lib/session'

export default async function Home() {
  const session = await verifySession()

  async function logout() {
    'use server'
    await deleteSession()
  }

  return (
    <>
      Hello {session?.name}
      {session ? (
        <button type="button" onClick={logout}>
          Logout
        </button>
      ) : (
        <a href="/sign-in">Login</a>
      )}
    </>
  )
}
