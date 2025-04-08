import { render } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { faker } from '@faker-js/faker'
import { useState } from 'react'
import { Row } from './row'
import { ColumnDefinition } from './table'

vi.mock('@mui/material/TableCell', () => ({
  default: vi.fn((props) => <td data-testid="table-cell" {...props} />),
}))

vi.mock('@mui/material/TableRow', () => ({
  default: vi.fn((props) => <tr data-testid="table-row" {...props} />),
}))

const stubData = {
  name: 'Yoda',
  age: 900,
}

describe(Row, () => {
  it('should render column contents by field name', () => {
    const columns: ColumnDefinition<typeof stubData>[] = [
      {
        content: 'name',
        header: 'Name',
        key: 'name',
      },
      {
        content: 'age',
        header: 'Age',
        key: 'age',
      },
    ]

    const { getAllByTestId } = render(<Row data={stubData} columns={columns} />)

    const cells = getAllByTestId('table-cell')
    expect(cells).toHaveLength(2)
    expect(cells[0].textContent).toBe(stubData.name)
    expect(cells[1].textContent).toBe(String(stubData.age))
  })

  it('should pass data as prop when content is a component', () => {
    const contentMock = vi.fn()
    const columns: ColumnDefinition<typeof stubData>[] = [
      {
        key: 1,
        content: contentMock,
        header: 'whatever',
      },
    ]

    render(<Row data={stubData} columns={columns} />)

    expect(contentMock).toHaveBeenCalledOnce()
    expect(contentMock.mock.calls[0][0]).toEqual({
      data: stubData,
    })
  })

  it('should render the component when content is a component', () => {
    const testId = faker.string.uuid()

    const columns: ColumnDefinition<typeof stubData>[] = [
      {
        key: 1,
        content() {
          // Invokes any hook just to ensure it's treated as a component
          useState()
          return <div data-testid={testId} />
        },
        header: 'whatever',
      },
    ]

    const { getByTestId } = render(<Row data={stubData} columns={columns} />)

    const cell = getByTestId(testId)
    expect(cell).toBeInTheDocument()
  })

  it('passes cellProps to TableCell', () => {
    const column: ColumnDefinition<typeof stubData> = {
      key: 1,
      content: 'name',
      header: 'whatever',
      cellProps: {
        className: faker.string.alpha(5),
      },
    }

    const { getByTestId } = render(<Row data={stubData} columns={[column]} />)

    const cell = getByTestId('table-cell')
    expect(cell).toHaveAttribute('class', column.cellProps?.className)
  })

  it('should forward rowProps to TableRow', () => {
    const rowProps = {
      className: faker.string.alpha(5),
    }

    const { getByTestId } = render(
      <Row data={stubData} columns={[]} {...rowProps} />
    )

    const row = getByTestId('table-row')
    expect(row).toHaveAttribute('class', rowProps.className)
  })
})
