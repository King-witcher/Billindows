export type ClientMessage = {
  id: string
  role: 'user' | 'assistant' | 'internal'
  content: string
  sentAt: Date
}

export type SendMessageResult = {
  response: string
  invalidate: {
    transactions: boolean
    categories: boolean
  }
}
