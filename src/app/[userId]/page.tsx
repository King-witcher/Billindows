import { prisma } from '@/services'

interface Props {
  params: Promise<{ userId: string }>
}

export default async function Page({ params }: Props) {
  const awaitedParams = await params
  const user = await prisma.user.findUnique({
    where: {
      id: Number(awaitedParams.userId),
    },
    include: {
      categories: true,
    },
  })

  if (!user) {
    return <h1>User not found</h1>
  }

  return (
    <>
      <h1>User {user.name}</h1>
      <table>
        <thead>
          <tr>
            <th>Id</th>
            <th>Category</th>
            <th>Goal</th>
          </tr>
        </thead>
        <tbody>
          {user.categories.map((category) => (
            <tr key={category.id} style={{ color: category.color }}>
              <td>{category.id}</td>
              <td>{category.name}</td>
              <td>{category.goal}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
