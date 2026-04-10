import React, { useMemo } from 'react'

import type { TableProps } from 'antd'
import { Table } from 'antd'

import { taxonomiaPaginationLocale } from '@/features/taxonomia-shared/utils/tablePaginationLocale'
import { normalizeTaxonomiaTableSorterChange } from '@/features/taxonomia-shared/utils/tableSorter'
import { EditOutlined } from '@ant-design/icons'

import type {
  Reino, ReinoMetadata, ReinoSorter, ReinoTableRow
} from '../types'

export interface ReinoTableProps {
  reinos: Reino[]
  metadata: Partial<ReinoMetadata>
  page: number
  pageSize: number
  loading: boolean
  lastSorter: ReinoSorter | undefined
  canEdit: boolean
  onEdit: (reino: Reino) => void
  onChange: (
    page: number,
    pageSize: number,
    sorter: ReinoSorter | undefined,
    sortChanged: boolean
  ) => void
}

const ReinoTable: React.FC<ReinoTableProps> = ({
  reinos,
  metadata,
  page,
  pageSize,
  loading,
  lastSorter,
  canEdit,
  onEdit,
  onChange
}) => {
  const dataSource = useMemo<ReinoTableRow[]>(
    () =>
      reinos.map(item => ({
        key: item.id,
        reino: item.nome,
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
              aria-label={`Editar reino ${item.nome}`}
            >
              <EditOutlined style={{ color: '#FFCC00' }} />
            </button>
          )
          : undefined
      })),
    [
      canEdit,
      onEdit,
      reinos
    ]
  )

  const columns: NonNullable<TableProps<ReinoTableRow>['columns']> = useMemo(() => {
    const base: NonNullable<TableProps<ReinoTableRow>['columns']> = [
      {
        title: 'Reino',
        dataIndex: 'reino',
        key: 'reino',
        sorter: true
      }
    ]
    if (canEdit) {
      base.push({
        title: 'Ação',
        dataIndex: 'action',
        key: 'action',
        width: 50,
        render: (_: unknown, record: ReinoTableRow) => record.action
      })
    }
    return base
  }, [canEdit])

  const handleChange: TableProps<ReinoTableRow>['onChange'] = (pagination, _filters, sorter) => {
    const { nextSorter, sortChanged } = normalizeTaxonomiaTableSorterChange(lastSorter, sorter)

    onChange(
      pagination.current ?? 1,
      pagination.pageSize ?? 20,
      nextSorter,
      sortChanged
    )
  }

  return (
    <Table<ReinoTableRow>
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

export default ReinoTable
