import { faker } from '@faker-js/faker'
import type { Category } from '@prisma/client'
import { getByText, render } from '@testing-library/react'
import { CategoryRow } from './category-row'

function noop() {}

describe('category row', () => {
  it('properly renders the price', () => {
    const category: Category = {
      id: 0,
      user_id: 0,
      name: faker.finance.transactionType(),
      color: faker.color.rgb(),
      goal: 12_345,
    }

    vi.mock('next/navigation', () => require('next-router-mock'))

    const { container } = render(<CategoryRow onDelete={noop} onEdit={noop} category={category} />)

    getByText(container, 'R$ 123.45')
  })
})
