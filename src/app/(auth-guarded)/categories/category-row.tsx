'use client'

import { MdDeleteOutline } from 'react-icons/md'

interface Props {
  category: any
}

export function CategoryRow({ category }: Props) {
  const goal = ((category.goal / 100) as number).toFixed(2)

  return (
    <div className="bg-white h-[50px] rounded-[4px] col-span-full grid grid-cols-subgrid shadow-sm items-center px-[20px] gap-[10px]">
      <div className="flex items-center gap-[10px]">
        <div
          className="ball w-[8px] h-[8px] rounded-[9999px]"
          style={{ background: category.color }}
        />
        {category.name}
      </div>
      <span className="text-right">R$ {goal}</span>
      <div>
        <MdDeleteOutline />
      </div>
    </div>
  )
}
