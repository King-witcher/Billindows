import { verifySession } from '@/lib/session'
import { formatMoney } from '@/utils/utils'
import { Card, CardContent, Typography } from '@mui/material'
import Paper from '@mui/material/Paper'
import { getFixedTxs } from '@/utils/queries/get-fixed-txs'
import { getOneTimeTxs } from '@/utils/queries/get-one-time-txs'

export const metadata = {
  title: 'Billindows - Dashboard',
}

export default async function Page() {
  const session = await verifySession()
  if (!session) return null

  const now = new Date()

  const [fixed, oneTime] = await Promise.all([
    getFixedTxs(session.id, now.getFullYear(), now.getMonth()),
    getOneTimeTxs(session.id, now.getFullYear(), now.getMonth()),
  ])

  const fixedBalance = fixed.reduce((prev, current) => prev + current.value, 0)

  const oneTimeBalance = oneTime.reduce(
    (prev, current) => prev + current.value,
    0
  )

  const balance = fixedBalance + oneTimeBalance

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
        <Typography variant="h4" color="textSecondary" gutterBottom>
          One-off performance
        </Typography>
        <div className="flex flex-col sm:flex-row gap-[20px]">
          <Card className="flex-1">
            <CardContent>
              <Typography variant="h4" gutterBottom component="div">
                Balance
              </Typography>
              <Typography
                color={balance < 0 ? 'error' : 'success'}
                variant="h5"
                gutterBottom
                component="div"
              >
                {formatMoney(balance)}
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
                Rate
              </Typography>
              <Typography
                color={balance < 0 ? 'error' : 'success'}
                variant="h5"
                gutterBottom
                component="div"
              >
                {formatMoney(balance / currentDay)}
                <Typography component="span" color="textSecondary">
                  /day
                </Typography>
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
                Monthly forecast
              </Typography>
              <Typography
                color={balance < 0 ? 'error' : 'success'}
                variant="h5"
                gutterBottom
                component="div"
              >
                {formatMoney(oneTimeBalance / monthProgress + fixedBalance)}
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
      </Paper>
    </div>
  )
}
