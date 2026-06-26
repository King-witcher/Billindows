import { faker } from '@faker-js/faker'
import { getByText, render } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import type { CategoryRow } from '@/lib/database/types'
import { CategoryItem } from './category-row'

function noop() {}

describe('category row', () => {
  it('properly renders the price', () => {
    const category: CategoryRow = {
      id: faker.string.uuid(),
      user_id: faker.string.uuid(),
      name: faker.finance.transactionType(),
      color: faker.color.rgb(),
      goal: 12_345,
    }

    const { container } = render(
      <NextIntlClientProvider locale="pt" messages={{}}>
        <CategoryItem onDelete={noop} onEdit={noop} category={category} />
      </NextIntlClientProvider>,
    )

    getByText(container, 'R$ 123,45')
  })
})
