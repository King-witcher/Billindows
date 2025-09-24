import z from 'zod'

export const schema = z.object({
  email: z.string().nonempty('Email is required').email(),
  password: z.string(),
  referrer: z.string().default('/'),
})

export type SignInPayload = z.infer<typeof schema>
