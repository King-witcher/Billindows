'use client'

import { BotIcon, Send } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { useChat } from '@/contexts/chat/chat-context'
import { ChatMessage } from '../../atoms/chat-message/chat-message'

export function ChatWindow() {
  const { messages, writting, sendMessage } = useChat()
  const [inputValue, setInputValue] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  // biome-ignore lint/correctness/useExhaustiveDependencies: scrolling
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  async function handleSendMessage(e?: React.FormEvent) {
    e?.preventDefault()

    if (!inputValue.trim()) return

    const message = inputValue
    setInputValue('')

    await sendMessage(message)
  }

  return (
    <div className="w-full h-full flex flex-col">
      <CardHeader className="p-4 border-b flex items-center flex-row gap-2 text-primary">
        <BotIcon className="" />
        <CardTitle className="text-lg">Assistant</CardTitle>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden">
        <div ref={scrollRef} className="h-full overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm text-center">
              How can I help you with your finances today?
            </div>
          )}

          {messages.map((message) => (
            <ChatMessage key={message.sentAt.toISOString()} message={message} />
          ))}
          {writting && <Spinner />}
        </div>
      </CardContent>

      <CardFooter className="p-2 sm:p-3 border-t">
        <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">
          <Input
            id="message"
            placeholder="Type your message..."
            className="flex-1"
            autoComplete="off"
            value={inputValue}
            multiple
            onChange={(e) => setInputValue(e.target.value)}
            disabled={writting}
          />
          <Button type="submit" size="icon" disabled={writting || !inputValue.trim()}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </div>
  )
}
