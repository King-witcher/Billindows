import Page from '@/app/(authenticate)/sign-up/page'
import { expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'

test('Sign up page', () => {
  render(<Page />)
  // expect(!!screen.queryByRole('textbox')).toBeTruthy()
})
