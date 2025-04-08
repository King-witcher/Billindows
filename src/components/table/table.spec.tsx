import { render } from '@testing-library/react'
import { type ColumnDefinition, Table } from './table'
import '@testing-library/jest-dom/vitest'
import { faker } from '@faker-js/faker'
import { Mock } from 'vitest'
import { Row } from './row'
const RowMock = Row as unknown as Mock

vi.mock('./row', () => ({
  Row: vi.fn(({ ref, ...props }) => (
    <tr data-testid="table-row" data-hasref={Boolean(ref)} {...props} />
  )),
}))

interface TestData {
  id: number
  name: string
  age: number
}

const stubData: TestData[] = [
  { id: 1, name: 'Luke', age: 23 },
  { id: 2, name: 'Leia', age: 23 },
  { id: 3, name: 'Han', age: 32 },
]

const stubColumns: ColumnDefinition<TestData>[] = [
  {
    key: 'name',
    header: 'Name',
    content: 'name',
  },
  {
    key: 'age',
    header: 'Age',
    content: 'age',
  },
  {
    key: 'custom',
    header: 'Custom',
    content: ({ data }) => (
      <span data-testid={`custom-${data.id}`}>Custom {data.name}</span>
    ),
  },
]

describe(Table, () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  const getKey = (row: TestData) => row.id

  it('should render the header names', () => {
    const { getByText } = render(
      <Table data={stubData} columns={stubColumns} getKey={getKey} />
    )

    expect(getByText('Name')).toBeInTheDocument()
    expect(getByText('Age')).toBeInTheDocument()
    expect(getByText('Custom')).toBeInTheDocument()
  })

  it('should render the data', () => {
    const { getAllByTestId } = render(
      <Table data={stubData} columns={stubColumns} getKey={getKey} />
    )

    const rows = getAllByTestId('table-row')
    expect(rows.length).toBe(stubData.length)
  })

  it('applies custom row props', () => {
    const customRowProps = {
      className: faker.string.alpha(5),
    }

    render(
      <Table
        data={stubData}
        columns={stubColumns}
        getKey={getKey}
        rowProps={customRowProps}
      />
    )

    expect(RowMock).toHaveBeenCalled()
    expect(RowMock.mock.calls[0][0]?.className).toBe(customRowProps.className)
  })

  it('renders children inside the TableContainer', () => {
    const { getByTestId } = render(
      <Table data={stubData} columns={stubColumns} getKey={getKey}>
        <div data-testid="child-element" />
      </Table>
    )

    expect(getByTestId('child-element')).toBeInTheDocument()
  })

  it('sets ref on the last row only', () => {
    const lastRowRef = { current: null }

    const { getAllByTestId } = render(
      <Table
        data={stubData}
        columns={stubColumns}
        getKey={getKey}
        lastRowRef={lastRowRef}
      />
    )

    const rows = getAllByTestId('table-row')

    rows.forEach((row, index) => {
      if (index === rows.length - 1) {
        expect(row.getAttribute('data-hasref')).toBe('true')
      } else {
        expect(row.getAttribute('data-hasref')).toBe('false')
      }
    })
  })
})
