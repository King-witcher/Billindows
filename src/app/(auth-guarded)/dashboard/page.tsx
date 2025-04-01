import { verifySession } from '@/lib/session'
import { prisma } from '@/services/prisma'
import { getFixedTxs } from '@/utils/queries/get-fixed-txs'
import { getOneTimeTxs } from '@/utils/queries/get-one-time-txs'
import { formatMoney } from '@/utils/utils'
import {
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import Paper from '@mui/material/Paper'
import { CategoryRow, DashboardCategory } from './category-row'

export const metadata = {
  title: 'Billindows - Dashboard',
}

export default async function Page() {
  const session = await verifySession()
  if (!session) return null

  const now = new Date(2025, 3, 1)
  const daysInTheMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0
  ).getDate()
  const currentDay = now.getDate()
  const monthProgress = currentDay / daysInTheMonth

  const [fixed, oneTime, categories] = await Promise.all([
    getFixedTxs(session.id, now.getFullYear(), now.getMonth()),
    getOneTimeTxs(session.id, now.getFullYear(), now.getMonth()),
    prisma.category.findMany({
      where: {
        user_id: session.id,
      },
    }),
  ])

  const categoryRows: DashboardCategory[] = categories.map((category) => {
    const categoryFixed = fixed
      .filter((tx) => tx.category.id === category.id)
      .reduce((prev, current) => prev + current.value, 0)

    const categoryOt = oneTime
      .filter((tx) => tx.category.id === category.id)
      .reduce((prev, current) => prev + current.value, 0)

    return {
      id: category.id,
      name: category.name,
      balance: categoryFixed + categoryOt,
      color: category.color,
      goal: category.goal,
      forecast: categoryFixed + categoryOt / monthProgress,
    }
  })

  const currentOt = oneTime.filter(
    (tx) =>
      tx.month < now.getMonth() ||
      (tx.month === now.getMonth() && tx.day <= now.getDate())
  )

  const fixedIncomes = fixed
    .filter((income) => income.value > 0)
    .reduce((prev, current) => prev + current.value, 0)

  const fixedExpenses = fixed
    .filter((income) => income.value < 0)
    .reduce((prev, current) => prev + current.value, 0)

  const otIncomes = oneTime
    .filter((income) => income.value > 0)
    .reduce((prev, current) => prev + current.value, 0)

  const otExpenses = oneTime
    .filter((income) => income.value < 0)
    .reduce((prev, current) => prev + current.value, 0)

  const fixedBalance = fixed.reduce((prev, current) => prev + current.value, 0)

  const currentOtBalance = currentOt.reduce(
    (prev, current) => prev + current.value,
    0
  )

  const totalOtBalance = oneTime.reduce(
    (prev, current) => prev + current.value,
    0
  )

  const currentBalance = fixedBalance + currentOtBalance
  const totalBalance = fixedBalance + totalOtBalance

  return (
    <div className="w-full min-h-full p-[20px]">
      <Paper className="p-[40px] h-full">
        <Typography variant="h3" gutterBottom color="primary">
          Welcome, {session.name}!
        </Typography>
        <div className="flex flex-col gap-[20px] mt-[40px]">
          <Typography variant="h5" color="textSecondary">
            Monthly performance
          </Typography>
          <div className="flex flex-col sm:flex-row gap-[20px]">
            <Card className="flex-1" variant="outlined">
              <CardContent>
                <Typography variant="h4" gutterBottom component="div">
                  Current Balance
                </Typography>
                <Typography
                  color={currentBalance < 0 ? 'error' : 'success'}
                  variant="h5"
                  gutterBottom
                  component="div"
                >
                  {formatMoney(currentBalance)}
                </Typography>
                <Typography
                  variant="body1"
                  color="textSecondary"
                  gutterBottom
                  component="div"
                >
                  Expected: -
                </Typography>
              </CardContent>
            </Card>
            <Card className="flex-1" variant="outlined">
              <CardContent>
                <Typography variant="h4" gutterBottom component="div">
                  Balance Forecast
                </Typography>
                <Typography
                  color={totalBalance < 0 ? 'error' : 'success'}
                  variant="h5"
                  gutterBottom
                  component="div"
                >
                  {formatMoney(currentOtBalance / monthProgress + fixedBalance)}
                </Typography>
                <Typography
                  variant="body1"
                  color="textSecondary"
                  gutterBottom
                  component="div"
                >
                  Goal: -
                </Typography>
              </CardContent>
            </Card>
          </div>
          <div className="flex flex-col sm:flex-row gap-[20px]">
            <Card className="flex-1" variant="outlined">
              <CardContent>
                <Typography variant="h4" gutterBottom component="div">
                  Fixed Incomes
                </Typography>
                <Typography
                  color="success"
                  variant="h5"
                  gutterBottom
                  component="div"
                >
                  {formatMoney(fixedIncomes)}
                </Typography>
              </CardContent>
            </Card>
            <Card className="flex-1" variant="outlined">
              <CardContent>
                <Typography variant="h4" gutterBottom component="div">
                  Fixed Expenses
                </Typography>
                <Typography
                  color="error"
                  variant="h5"
                  gutterBottom
                  component="div"
                >
                  {formatMoney(fixedExpenses)}
                </Typography>
              </CardContent>
            </Card>
            <Card className="flex-1" variant="outlined">
              <CardContent>
                <Typography variant="h4" gutterBottom component="div">
                  One Time Expenses
                </Typography>
                <Typography
                  color="error"
                  variant="h5"
                  gutterBottom
                  component="div"
                >
                  {formatMoney(otExpenses)}
                </Typography>
              </CardContent>
            </Card>
          </div>
          <Typography variant="h5" color="textSecondary">
            Categories
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Category</TableCell>
                  <TableCell align="center">Balance</TableCell>
                  <TableCell align="center">Goal</TableCell>
                  <TableCell align="right">Forecast</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categoryRows.map((category) => (
                  <CategoryRow key={category.id} category={category} />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </Paper>
    </div>
  )
}
