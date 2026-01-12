import { ZodObject } from 'zod'

// biome-ignore lint/suspicious/noExplicitAny: no other way to type this
export type ToolExecuteArgs = Record<string, any>

export type Tool = {
  schema: ZodObject
  name: string
  description: string
  execute: (args: ToolExecuteArgs) => Promise<string>
}
