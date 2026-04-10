import React, { useMemo } from 'react'

import type { TableProps } from 'antd'
import { Table } from 'antd'

import { taxonomiaPaginationLocale } from '@/features/taxonomia-shared/utils/tablePaginationLocale'
import { normalizeTaxonomiaTableSorterChange } from '@/features/taxonomia-shared/utils/tableSorter'
import { EditOutlined } from '@ant-design/icons'

import type {
  Autor, AutorMetadata, AutorSorter, AutorTableRow
} from '../types'

export interface AutorTableProps {
  autores: Autor[]
  metadata: Partial<AutorMetadata>
  page: number
  pageSize: number
  loading: boolean
  lastSorter: AutorSorter | undefined
  canEdit: boolean
  onEdit: (autor: Autor) => void
  onChange: (
    page: number,
    pageSize: number,
    sorter: AutorSorter | undefined,
    sortChanged: boolean
  ) => void
}

const AutorTable: React.FC<AutorTableProps> = ({
  autores,
  metadata,
  page,
  pageSize,
  loading,
  lastSorter,
  canEdit,
  onEdit,
  onChange
}) => {
  const dataSource = useMemo<AutorTableRow[]>(
    () =>
      autores.map(item => ({
        key: item.id,
        autor: item.nome,
        observacao: item.observacao ?? '',
        action: canEdit
          ? (
            <button
              type="button"
              onClick={() => onEdit(item)}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer'
              }}
              aria-label={`Editar autor ${item.nome}`}
            >
              <EditOutlined style={{ color: '#FFCC00' }} />
            </button>
          )
          : undefined
      })),
    [
      canEdit,
      onEdit,
      autores
    ]
  )

  const columns: NonNullable<TableProps<AutorTableRow>['columns']> = useMemo(() => {
    const base: NonNullable<TableProps<AutorTableRow>['columns']> = [
      {
        title: 'Autor',
        dataIndex: 'autor',
        key: 'autor',
        sorter: true
      },
      {
        title: 'Observação',
        dataIndex: 'observacao',
        key: 'observacao',
        sorter: true
      }
    ]
    if (canEdit) {
      base.push({
        title: 'Ação',
        dataIndex: 'action',
        key: 'action',
        width: 50,
        render: (_: unknown, record: AutorTableRow) => record.action
      })
    }
    return base
  }, [canEdit])

  const handleChange: TableProps<AutorTableRow>['onChange'] = (pagination, _filters, sorter) => {
    const { nextSorter, sortChanged } = normalizeTaxonomiaTableSorterChange(lastSorter, sorter)

    onChange(
      pagination.current ?? 1,
      pagination.pageSize ?? 20,
      nextSorter,
      sortChanged
    )
  }

  return (
    <Table<AutorTableRow>
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

export default AutorTable
