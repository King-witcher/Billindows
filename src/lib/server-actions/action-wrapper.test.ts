import * as z from 'zod'
import { action } from './action-wrapper'
import { ClientError, InternalError } from './errors'

describe('action wrapper', () => {
  describe('without schema', () => {
    test('should execute function successfully', async () => {
      const fn = action(async () => ({ success: true }))
      const result = await fn()
      expect(result).toEqual({ success: true })
    })

    test('should convert generic errors to InternalError', async () => {
      const fn = action(async () => {
        throw new Error('Generic error')
      })
      await expect(fn()).rejects.toThrow(InternalError)
    })

    test('should preserve ClientError', async () => {
      const fn = action(async () => {
        throw new ClientError('CustomError', 'Custom error message')
      })
      await expect(fn()).rejects.toThrow(ClientError)
      await expect(fn()).rejects.toMatchObject({
        code: 'CustomError',
        message: 'Custom error message',
      })
    })
  })

  describe('with schema', () => {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
    })

    test('should validate and execute function successfully', async () => {
      const fn = action(schema, async (input) => ({
        message: `Hello ${input.name}, age ${input.age}`,
      }))

      const result = await fn({ name: 'John', age: 30 })
      expect(result).toEqual({ message: 'Hello John, age 30' })
    })

    test('should throw ClientError with ValidationError on invalid input', async () => {
      const fn = action(schema, async (input) => input)

      await expect(fn({ name: 'John', age: 'invalid' as unknown as number })).rejects.toThrow(
        ClientError,
      )

      try {
        await fn({ name: 'John', age: 'invalid' as unknown as number })
      } catch (err) {
        expect(err).toBeInstanceOf(ClientError)
        expect((err as ClientError).code).toBe('ValidationError')
      }
    })

    test('should preserve ClientError from function', async () => {
      const fn = action(schema, async () => {
        throw new ClientError('DatabaseError')
      })

      await expect(fn({ name: 'John', age: 30 })).rejects.toThrow(ClientError)
      await expect(fn({ name: 'John', age: 30 })).rejects.toMatchObject({
        code: 'DatabaseError',
      })
    })

    test('should convert generic errors to InternalError', async () => {
      const fn = action(schema, async () => {
        throw new Error('Database connection failed')
      })

      await expect(fn({ name: 'John', age: 30 })).rejects.toThrow(InternalError)
    })
  })
})
