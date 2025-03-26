import { deleteSession, verifySession } from '@/lib/session'
import { Typography } from '@mui/material'
import Paper from '@mui/material/Paper'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Billindows - Dashboard',
}

export default async function Page() {
  const session = await verifySession()
  if (!session) return null

  async function signOut() {
    'use server'
    await deleteSession()
    redirect('/sign-in')
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <Paper className="p-[40px] gap-[20px] flex flex-col">
        <Typography variant="h4" color="primary" className="text-center">
          Hello, {session.name}!
        </Typography>
        <Typography variant="body1" className="w-[300px]">
          We have nothing to show yet, but you can add transactions, categories
          or{' '}
          <Typography
            onClick={signOut}
            component="span"
            color="primary"
            className="cursor-pointer"
          >
            sign-out
          </Typography>{' '}
          from your account.
        </Typography>
      </Paper>
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
