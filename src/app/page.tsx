import { prisma } from '@/services'

export default async function Home() {
  const user = await prisma.user.findFirst()

  return <>{JSON.stringify(user)}</>
}
