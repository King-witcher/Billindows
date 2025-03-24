import { CircularProgress } from '@mui/material'

export function Loading() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <CircularProgress size="70px" />
    </div>
  )
}
