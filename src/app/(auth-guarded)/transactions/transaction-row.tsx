'use client'

interface Props {
  transaction: any
}

export function TransactionRow({ transaction }: Props) {
  return (
    <div className="bg-white h-[44px] rounded-[4px] shadow-sm flex items-center p-[10px] gap-[10px]">
      <div
        className="ball w-[8px] h-[8px] rounded-[9999px]"
        style={{ background: transaction.color }}
      />
      {transaction.name}
    </div>
  )
}
