import { verifySession } from '@/lib/session'
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

export const metadata = {
  title: 'Billindows - Dashboard',
}

export default async function Page() {
  const session = await verifySession()
  if (!session) return null

  const now = new Date(2025, 3, 1)

  const [fixed, oneTime] = await Promise.all([
    getFixedTxs(session.id, now.getFullYear(), now.getMonth()),
    getOneTimeTxs(session.id, now.getFullYear(), now.getMonth()),
  ])

  const currentOt = oneTime.filter(
    (tx) =>
      tx.month < now.getMonth() ||
      (tx.month === now.getMonth() && tx.day <= now.getDate())
  )

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

  const daysInTheMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0
  ).getDate()
  const currentDay = now.getDate()
  const monthProgress = currentDay / daysInTheMonth

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
            <Card className="flex-1">
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
            <Card className="flex-1">
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
          <Typography variant="h5" color="textSecondary">
            Categories
          </Typography>
          <TableContainer component={Paper}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Category</TableCell>
                  <TableCell align="center">Balance</TableCell>
                  <TableCell align="center">Goal</TableCell>
                  <TableCell align="right">Forecast</TableCell>
                </TableRow>
              </TableHead>
              <TableBody> </TableBody>
            </Table>
          </TableContainer>
        </div>
      </Paper>
    </div>
  )
}
