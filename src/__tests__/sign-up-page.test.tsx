import Page from '@/app/(authenticate)/sign-up/page'
import { render } from '@testing-library/react'
import { test } from 'vitest'

test('Sign up page', () => {
  render(<Page />)
  // expect(!!screen.queryByRole('textbox')).toBeTruthy()
})
