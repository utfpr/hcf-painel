import { ConfigProvider } from 'antd6'
import {
  describe,
  expect,
  test,
  vi
} from 'vitest'

import { DataTable } from '@/components/list/DataTable'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}))

interface Row {
  key: number
  nome: string
}

function renderTable(
  onChange = vi.fn(),
  onRowClick?: (row: Row) => void
) {
  return render(
    <ConfigProvider prefixCls="ant6">
      <DataTable<Row>
        rowKey="key"
        data={[
          { key: 1, nome: 'Ana' },
          { key: 2, nome: 'Bia' }
        ]}
        columns={[
          {
            key: 'nome',
            title: 'Nome',
            sortable: true,
            render: row => row.nome
          },
          {
            key: 'actions',
            title: 'Ações',
            hideable: false,
            render: () => (
              <button type="button" data-list-row-action="">
                menu
              </button>
            )
          }
        ]}
        view={{
          page: 1,
          pageSize: 20,
          total: 2,
          sort: null
        }}
        onChange={onChange}
        onRowClick={onRowClick}
      />
    </ConfigProvider>
  )
}

describe('DataTable', () => {
  test('renders cells from column render and does not sort data', () => {
    renderTable()
    expect(screen.getByText('Ana')).toBeInTheDocument()
    expect(screen.getByText('Bia')).toBeInTheDocument()
  })

  test('row click ignores interactive cells', async () => {
    const user = userEvent.setup()
    const onRowClick = vi.fn()
    renderTable(vi.fn(), onRowClick)

    await user.click(screen.getAllByText('menu')[0])
    expect(onRowClick).not.toHaveBeenCalled()

    await user.click(screen.getByText('Ana'))
    expect(onRowClick).toHaveBeenCalledTimes(1)
  })
})
