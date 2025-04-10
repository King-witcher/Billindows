import { CurrencyText } from '@/components/atoms/currency-text'
import { verifySession } from '@/lib/session'
import { prisma } from '@/services/prisma'
import { getFixedTxs } from '@/utils/queries/get-fixed-txs'
import { getOneTimeTxs } from '@/utils/queries/get-one-time-txs'
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
import { analyze } from './helpers'

export const metadata = {
  title: 'Billindows - Dashboard',
}

export default async function Page() {
  const session = await verifySession()
  if (!session) return null

  const now = new Date()
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
    const categoryFixed = fixed.filter((tx) => tx.category.id === category.id)
    const categoryOt = oneTime.filter((tx) => tx.category.id === category.id)

    const analyzed = analyze(
      [...categoryFixed, ...categoryOt],
      monthProgress,
      category.goal
    )

    return {
      id: category.id,
      name: category.name,
      balance: analyzed.balance,
      color: category.color,
      goal: category.goal,
      forecast: analyzed.forecast,
    }
  })

  const overallAnalysis = analyze([...fixed, ...oneTime], monthProgress, null)

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
                <CurrencyText
                  value={overallAnalysis.balance}
                  variant="h5"
                  gutterBottom
                />
              </CardContent>
            </Card>
            <Card className="flex-1" variant="outlined">
              <CardContent>
                <Typography variant="h4" gutterBottom component="div">
                  Balance Forecast
                </Typography>
                <CurrencyText
                  value={overallAnalysis.forecast}
                  variant="h5"
                  gutterBottom
                />
              </CardContent>
            </Card>
          </div>
          <div className="flex flex-col sm:flex-row gap-[20px]">
            <Card className="flex-1" variant="outlined">
              <CardContent>
                <Typography variant="h4" gutterBottom component="div">
                  Fixed Balance
                </Typography>

                <CurrencyText
                  value={overallAnalysis.fixed}
                  variant="h5"
                  gutterBottom
                />
              </CardContent>
            </Card>
            <Card className="flex-1" variant="outlined">
              <CardContent>
                <Typography variant="h4" gutterBottom component="div">
                  One Time Balance
                </Typography>

                <CurrencyText
                  value={overallAnalysis.oneTime}
                  variant="h5"
                  gutterBottom
                />
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
