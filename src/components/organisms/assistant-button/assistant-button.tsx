'use client'

import { BotIcon } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ChatWindow } from './chat-window'

export function AssistantButton() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="fixed bottom-5 right-5 z-10 rounded-[9999px] size-14 flex items-center justify-center text-white border-none shadow-lg cursor-pointer font-semibold bg-blue-500">
          <BotIcon size={28} />
        </div>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        className="w-dvw sm:w-120 h-[70dvh] p-0 relative -bottom-20 sm:bottom-0"
      >
        <ChatWindow />
      </PopoverContent>
    </Popover>
  )
}
