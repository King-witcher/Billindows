import { faker } from '@faker-js/faker'
import { getByText, render } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import type { CategoryRow } from '@/lib/database/types'
import { CategoryCard, type CategoryMonth } from './category-card'

const messages = {
  categories: {
    balanceInMonth: 'Saldo no mês',
    txCount: '{count, plural, =0 {sem transações} one {# transação} other {# transações}}',
  },
}

function noop() {}

describe('category card', () => {
  it('renders the category name and the month balance', () => {
    const category: CategoryRow = {
      id: faker.string.uuid(),
      user_id: faker.string.uuid(),
      name: 'Mercado',
      color: faker.color.rgb(),
      goal: null,
    }

    const month: CategoryMonth = {
      balance: -12_345,
      count: 3,
      transactions: [],
    }

    const { container } = render(
      <NextIntlClientProvider locale="pt" messages={messages}>
        <CategoryCard category={category} month={month} loading={false} onSelect={noop} />
      </NextIntlClientProvider>,
    )

    getByText(container, 'Mercado')
    getByText(container, '-R$ 123,45')
    getByText(container, '3 transações')
  })
})
