import type * as z from 'zod'
import type { DefaultContainer } from '../injector/dependencies'

export type Tool<TSchema extends z.ZodType = z.ZodType> = {
  name: string
  description: string
  schema: TSchema | ((ctx: DefaultContainer) => Promise<TSchema>)
  execute: (
    input: z.infer<TSchema>,
    ctx: DefaultContainer,
    schema: TSchema,
  ) => Promise<string> | string
}
