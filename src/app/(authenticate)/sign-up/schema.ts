import z from 'zod'

export const schema = z
  .object({
    email: z.string().nonempty('Email is required').email(),
    name: z
      .string()
      .min(4, 'Name must be at least 4 characters long')
      .max(20, 'Name must be at most 20 characters long'),
    password: z
      .string()
      .min(8, 'Password must contain at least 8 characters')
      .max(50, 'Password must contain at most 50 characters'),
    passwordConfirmation: z.string(),
    referrer: z.string().default('/'),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.passwordConfirmation) {
      ctx.addIssue({
        code: 'custom',
        message: 'Passwords do not match',
        fatal: true,
        path: ['passwordConfirmation'],
      })
    }
  })
