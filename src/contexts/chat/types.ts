export type ClientMessage = {
  id: string
  role: 'user' | 'assistant' | 'internal'
  content: string
  sentAt: Date
}
