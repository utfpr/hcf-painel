import React, { useMemo } from 'react'

import type { TableProps } from 'antd'
import { Table } from 'antd'

import { taxonomiaPaginationLocale } from '@/features/taxonomia-shared/utils/tablePaginationLocale'
import { normalizeTaxonomiaTableSorterChange } from '@/features/taxonomia-shared/utils/tableSorter'
import { EditOutlined } from '@ant-design/icons'

import type {
  Genero, GeneroMetadata, GeneroSorter, GeneroTableRow
} from '../types'

export interface GeneroTableProps {
  generos: Genero[]
  metadata: Partial<GeneroMetadata>
  page: number
  pageSize: number
  loading: boolean
  lastSorter: GeneroSorter | undefined
  canEdit: boolean
  onEdit: (genero: Genero) => void
  onChange: (
    page: number,
    pageSize: number,
    sorter: GeneroSorter | undefined,
    sortChanged: boolean
  ) => void
}

const GeneroTable: React.FC<GeneroTableProps> = ({
  generos,
  metadata,
  page,
  pageSize,
  loading,
  lastSorter,
  canEdit,
  onEdit,
  onChange
}) => {
  const dataSource = useMemo<GeneroTableRow[]>(
    () =>
      generos.map(item => ({
        key: item.id,
        genero: item.nome,
        familia: item.familia?.nome ?? '',
        action: canEdit
          ? (
            <button
              type="button"
              onClick={() => void onEdit(item)}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer'
              }}
              aria-label={`Editar gênero ${item.nome}`}
            >
              <EditOutlined style={{ color: '#FFCC00' }} />
            </button>
          )
          : undefined
      })),
    [
      canEdit,
      onEdit,
      generos
    ]
  )

  const columns: NonNullable<TableProps<GeneroTableRow>['columns']> = useMemo(() => {
    const base: NonNullable<TableProps<GeneroTableRow>['columns']> = [
      {
        title: 'Gênero',
        dataIndex: 'genero',
        key: 'genero',
        sorter: true
      },
      {
        title: 'Família',
        dataIndex: 'familia',
        key: 'familia',
        sorter: true
      }
    ]
    if (canEdit) {
      base.push({
        title: 'Ação',
        dataIndex: 'action',
        key: 'action',
        width: 50,
        render: (_: unknown, record: GeneroTableRow) => record.action
      })
    }
    return base
  }, [canEdit])

  const handleChange: TableProps<GeneroTableRow>['onChange'] = (pagination, _filters, sorter) => {
    const { nextSorter, sortChanged } = normalizeTaxonomiaTableSorterChange(lastSorter, sorter)

    onChange(
      pagination.current ?? 1,
      pagination.pageSize ?? 20,
      nextSorter,
      sortChanged
    )
  }

  return (
    <Table<GeneroTableRow>
      rowKey="key"
      columns={columns}
      dataSource={dataSource}
      loading={loading}
      onChange={handleChange}
      pagination={{
        total: metadata.total ?? 0,
        current: metadata.page ?? page,
        pageSize: metadata.limit ?? pageSize,
        showSizeChanger: true,
        locale: taxonomiaPaginationLocale
      }}
    />
  )
}

export default GeneroTable
