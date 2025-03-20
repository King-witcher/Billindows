import { GrTransaction } from 'react-icons/gr'
import { LuAlarmClock } from 'react-icons/lu'
import { MdOutlineCategory } from 'react-icons/md'
import { RiDashboard2Line } from 'react-icons/ri'
import { SidebarButton } from './button'
import { verifySession } from '@/lib/session'
import { FaCircleUser } from 'react-icons/fa6'

export async function Sidebar() {
  const session = await verifySession()

  return (
    <div className="w-[300px] bg-white shadow-lg p-[10px] gap-[10px] flex flex-col">
      <SidebarButton icon={<RiDashboard2Line />} disabled>
        Dashboard
      </SidebarButton>
      <SidebarButton icon={<GrTransaction />} disabled>
        Transactions (coming soon!)
      </SidebarButton>
      <SidebarButton icon={<MdOutlineCategory />} disabled>
        Categories
      </SidebarButton>
      <SidebarButton icon={<LuAlarmClock />} disabled>
        Reminders
      </SidebarButton>

      <section className="mt-auto flex items-center gap-[10px] p-[10px] cursor-pointer rounded-[4px] hover:bg-gray-100">
        <FaCircleUser className="text-5xl" />
        <div className="flex flex-col">
          <h3>{session?.name}</h3>
          <h3 className="text-sm text-gray-500">{session?.email}</h3>
        </div>
      </section>
    </div>
  )
}
