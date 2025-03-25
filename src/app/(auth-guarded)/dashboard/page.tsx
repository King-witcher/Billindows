import { deleteSession, verifySession } from '@/lib/session'
import { prisma } from '@/services/prisma'
import { redirect } from 'next/navigation'

export default async function Page() {
  const session = await verifySession()
  if (!session) return null
  const user = await prisma.user.findUnique({
    where: {
      id: Number(session.id),
    },
    include: {
      categories: true,
    },
  })

  async function signOut() {
    'use server'
    await deleteSession()
    redirect('/sign-in')
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="bg-white p-[40px] border-gray-300 border-1 rounded-[6px] shadow-md">
        <h1 className="text-xl text-emerald-700 text-center">
          Hello, {session.name}!
        </h1>
        <p className="mt-6 w-[300px] text-sm text-center text-gray-600">
          We have nothing to show yet, but you can{' '}
          <span
            onClick={signOut}
            className="text-emerald-600 cursor-pointer hover:text-emerald-800"
          >
            sign-out
          </span>{' '}
          from your account.
        </p>
      </div>
    </div>
  )

  // return (
  //   <>
  //     <h2>Categories</h2>
  //     <table>
  //       <thead>
  //         <tr>
  //           <th>Id</th>
  //           <th>Name</th>
  //           <th>Goal</th>
  //         </tr>
  //       </thead>
  //       <tbody>
  //         {user?.categories.map((category) => {
  //           return (
  //             <tr key={category.id} style={{ color: category.color }}>
  //               <td>{category.id}</td>
  //               <td>{category.name}</td>
  //               <td>{category.goal}</td>
  //             </tr>
  //           )
  //         })}
  //       </tbody>
  //     </table>
  //     <button>Create new category</button>
  //     <h2>Expenses</h2>
  //     <button>Create new expense</button>
  //   </>
  // )
}
