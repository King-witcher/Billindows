/** biome-ignore-all lint/suspicious/noExplicitAny: This file encapsulates it's anys. */
import * as z from 'zod'
import {
  buildDefaultContainer as buildDefaultContext,
  type DependencyContainer,
} from './dependencies'
import { ClientError, InternalError } from './errors'

// Overload 1: Sem schema, apenas função
export function action<TOutput>(
  fn: (ctx: DependencyContainer) => Promise<TOutput> | TOutput,
): () => Promise<TOutput>

// Overload 2: Com schema e função
export function action<TSchema extends z.ZodTypeAny, TOutput>(
  schema: TSchema,
  fn: (input: z.infer<TSchema>, ctx: DependencyContainer) => Promise<TOutput> | TOutput,
): (input: z.infer<TSchema>) => Promise<TOutput>

// Implementação
export function action<TOutput>(
  schemaOrFn: z.ZodTypeAny | ((ctx: DependencyContainer) => Promise<TOutput> | TOutput),
  fn?: (input: any, ctx: DependencyContainer) => Promise<TOutput> | TOutput,
): (input?: any, ctx?: DependencyContainer) => Promise<TOutput> {
  // If the first argument is a function, it's the no-schema version
  if (typeof schemaOrFn === 'function') {
    return async () => {
      try {
        const ctx = buildDefaultContext()
        return await schemaOrFn(ctx)
      } catch (err) {
        if (err instanceof ClientError) {
          // If the function throws a ClientError, preserve it
          console.error('ClientError:', err.code, err.message)
          throw err
        } else {
          // For any other errors, log and throw a generic InternalError
          console.error('Unhandled error:', err)
          throw new InternalError()
        }
      }
    }

    // If the first argument is a schema and the second is a function, it's the schema version
  } else if (fn) {
    return async (input) => {
      try {
        const ctx = buildDefaultContext()
        const parsedInput = schemaOrFn.parse(input)
        return await fn(parsedInput, ctx)
      } catch (err) {
        if (err instanceof z.ZodError) {
          // If zod fails to parse, throw a ValidationError
          console.error('Validation error:', err.issues)
          throw new ClientError('ValidationError', err.message, { cause: err })
        } else if (err instanceof ClientError) {
          // If the function throws a ClientError, preserve it
          console.error('ClientError:', err.code, err.message)
          throw err
        } else {
          // For any other errors, log and throw a generic InternalError
          console.error('Unhandled error:', err)
          throw new InternalError()
        }
      }
    }
  } else throw new Error('Invalid arguments: expected (fn) or (schema, fn)')
}
