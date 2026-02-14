'use client'

import { type ComponentProps, type KeyboardEvent, type SubmitEvent, useEffect, useRef } from 'react'
import { ChatMessage } from '@/components/atoms/chat-message/chat-message'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { useChat } from '@/contexts/chat/chat-context'
import { cn } from '@/lib/utils'

export function Chat({ className, ...rest }: ComponentProps<'div'>) {
  const { messages, writting, sendMessage } = useChat()
  const scrollRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    if (writting) return

    const formData = new FormData(e.currentTarget as HTMLFormElement)
    const message = formData.get('message')?.toString()
    if (message) {
      console.log(message)
      sendMessage(message)
      e.currentTarget.reset()
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: scrolling
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages[messages.length - 1]?.sentAt])

  function handleEnterPress(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      formRef.current?.requestSubmit()
    }
  }

  return (
    <div className={cn('w-100 bg-white border-l border-border', className)} {...rest}>
      <div className="flex flex-col h-full">
        {/* Messages container */}
        <div className="flex-1 relative">
          <div className="absolute inset-0 overflow-y-scroll scroll-smooth p-4" ref={scrollRef}>
            <div className="flex flex-col gap-2 min-h-full justify-end">
              {messages.map((message) => (
                <ChatMessage key={message.sentAt.toISOString()} message={message} />
              ))}
              {writting && <Spinner />}
            </div>
          </div>
        </div>
        {/* Input container */}
        <div className="p-4 border-t border-border bg-background">
          <form onSubmit={handleSubmit} ref={formRef}>
            <Textarea
              name="message"
              autoComplete="off"
              onKeyDown={handleEnterPress}
              placeholder="Type your message..."
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring resize-none bg-white"
            />
          </form>
        </div>
      </div>
    </div>
  )
}
