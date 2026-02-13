import z from 'zod'

export const schema = z.object({
  email: z.email().nonempty('Email is required'),
  password: z.string(),
  referrer: z.string().default('/'),
})

export type SignInPayload = z.infer<typeof schema>
