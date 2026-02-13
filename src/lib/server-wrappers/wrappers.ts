/** biome-ignore-all lint/suspicious/noExplicitAny: This file encapsulates it's anys. */

import type { ReactNode } from 'react'
import * as z from 'zod'
import {
  buildDefaultContainer as buildDefaultContext,
  type DependencyContainer,
} from '../injector/dependencies'
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
    return wrapWithoutParams(schemaOrFn)
    // If the first argument is a schema and the second is a function, it's the schema version
  } else if (fn) {
    return wrapWithSchema(schemaOrFn, fn)
  } else throw new Error('Invalid arguments: expected (fn) or (schema, fn)')
}

export const page = wrapWithoutParams<ReactNode>

export function layout<TParams>(
  fn: (
    params: { children: ReactNode } & TParams,
    ctx: DependencyContainer,
  ) => Promise<ReactNode> | ReactNode,
): (params: { children: ReactNode } & TParams) => Promise<ReactNode> {
  return async (params: { children: ReactNode } & TParams) => {
    try {
      const ctx = buildDefaultContext()
      return await fn(params, ctx)
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
}

function wrapWithoutParams<TOutput>(
  fn: (ctx: DependencyContainer) => Promise<TOutput> | TOutput,
): () => Promise<TOutput> {
  return async () => {
    try {
      const ctx = buildDefaultContext()
      return await fn(ctx)
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
}

export function wrapWithSchema<TSchema extends z.ZodTypeAny, TOutput>(
  schema: TSchema,
  fn: (input: z.infer<TSchema>, ctx: DependencyContainer) => Promise<TOutput> | TOutput,
): (input: z.infer<TSchema>) => Promise<TOutput> {
  return async (input) => {
    try {
      const ctx = buildDefaultContext()
      const parsedInput = schema.parse(input)
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
}
