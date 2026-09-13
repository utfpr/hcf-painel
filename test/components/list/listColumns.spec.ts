import {
  describe,
  expect,
  test
} from 'vitest'

import type { DataTableColumn } from '@/components/list/DataTable'
import { columnCatalogConfig, visibleColumns } from '@/components/list/listColumns'

interface Row {
  key: number
  nome: string
}

const catalog: DataTableColumn<Row>[] = [
  {
    key: 'nome',
    title: 'Nome',
    hideable: false,
    sortable: true,
    render: row => row.nome
  },
  {
    key: 'email',
    title: 'E-mail',
    sortable: true,
    render: row => row.nome
  },
  {
    key: 'telefone',
    title: 'Telefone',
    render: row => row.nome
  },
  {
    key: 'actions',
    title: 'Ações',
    hideable: false,
    render: () => null
  }
]

describe('columnCatalogConfig', () => {
  test('derives settings, mandatory, and sortable keys from columns', () => {
    const config = columnCatalogConfig(catalog)

    expect(config.columnKeys).toEqual([
      'nome',
      'email',
      'telefone'
    ])
    expect(config.mandatoryColumnKeys).toEqual(['nome'])
    expect(config.allowedSortKeys).toEqual([
      'nome',
      'email'
    ])
  })

  test('keeps mandatory columns when they are missing from visibleKeys', () => {
    const next = visibleColumns(catalog, ['email'])
    expect(next.map(column => column.key)).toEqual([
      'nome',
      'email',
      'actions'
    ])
  })
})
