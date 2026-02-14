import clsx from 'clsx'
import type { ClientMessage } from '@/contexts/chat/chat-context'
import { cn } from '@/lib/utils'

type Props = {
  message: ClientMessage
}

export function ChatMessage({ message }: Props) {
  return (
    <div className={clsx('flex flex-col', message.role === 'user' ? 'items-end' : 'items-start')}>
      <p
        key={message.sentAt.toISOString()}
        className={cn(
          'flex w-max max-w-[80%] flex-col gap-2 rounded-lg px-3 py-2 text-sm relative whitespace-pre-wrap',
          message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-gray-200',
        )}
      >
        {message.content}
        <svg
          className={clsx(
            'absolute -right-3 bottom-0',
            message.role === 'user'
              ? '-right-3 text-primary'
              : '-left-3 -scale-x-100 text-gray-200',
          )}
          width={24}
          height={24}
          viewBox="0 0 100 100"
        >
          <title> </title>
          <path
            d="M 0 0 L 50 0 Q 50 60 80 100 Q 30 100 0 50"
            stroke="transparent"
            fill="currentColor"
          />
        </svg>
      </p>
      <span className="text-[11px] px-1 text-muted-foreground">
        {message.sentAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  )
}
