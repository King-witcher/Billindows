'use client'

import { Send } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useChat } from '@/contexts/chat-context'
import { cn } from '@/lib/utils'

export function ChatWindow() {
  const { messages, sendMessage } = useChat()
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  async function handleSendMessage(e?: React.FormEvent) {
    e?.preventDefault()

    if (!inputValue.trim() || isLoading) return

    const message = inputValue
    setInputValue('')
    setIsLoading(true)

    try {
      await sendMessage(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full h-full flex flex-col">
      <CardHeader className="p-4 border-b">
        <CardTitle className="text-lg">Assistente</CardTitle>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden">
        <div ref={scrollRef} className="h-full overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm text-center">
              Como posso ajudar você com suas finanças hoje?
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                'flex w-max max-w-[80%] flex-col gap-2 rounded-lg px-3 py-2 text-sm',
                message.role === 'user'
                  ? 'ml-auto bg-primary text-primary-foreground'
                  : 'bg-muted'
              )}
            >
              {message.content}
            </div>
          ))}

          {isLoading && (
            <div className="bg-muted w-max rounded-lg px-3 py-2 text-sm">
              Digitando...
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-3 border-t">
        <form
          onSubmit={handleSendMessage}
          className="flex w-full items-center gap-2"
        >
          <Input
            id="message"
            placeholder="Digite sua mensagem..."
            className="flex-1"
            autoComplete="off"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !inputValue.trim()}
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Enviar</span>
          </Button>
        </form>
      </CardFooter>
    </div>
  )
}
