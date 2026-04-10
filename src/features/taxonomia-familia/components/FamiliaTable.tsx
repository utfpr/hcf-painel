import React, { useMemo } from 'react'

import type { TableProps } from 'antd'
import { Table } from 'antd'

import { taxonomiaPaginationLocale } from '@/features/taxonomia-shared/utils/tablePaginationLocale'
import { normalizeTaxonomiaTableSorterChange } from '@/features/taxonomia-shared/utils/tableSorter'
import { EditOutlined } from '@ant-design/icons'

import type {
  Familia, FamiliaMetadata, FamiliaSorter, FamiliaTableRow
} from '../types'

export interface FamiliaTableProps {
  familias: Familia[]
  metadata: Partial<FamiliaMetadata>
  page: number
  pageSize: number
  loading: boolean
  lastSorter: FamiliaSorter | undefined
  canEdit: boolean
  onEdit: (familia: Familia) => void
  onChange: (
    page: number,
    pageSize: number,
    sorter: FamiliaSorter | undefined,
    sortChanged: boolean
  ) => void
}

const FamiliaTable: React.FC<FamiliaTableProps> = ({
  familias,
  metadata,
  page,
  pageSize,
  loading,
  lastSorter,
  canEdit,
  onEdit,
  onChange
}) => {
  const dataSource = useMemo<FamiliaTableRow[]>(
    () =>
      familias.map(item => ({
        key: item.id,
        familia: item.nome,
        reino: item.reino?.nome ?? '',
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
              aria-label={`Editar família ${item.nome}`}
            >
              <EditOutlined style={{ color: '#FFCC00' }} />
            </button>
          )
          : undefined
      })),
    [
      canEdit,
      onEdit,
      familias
    ]
  )

  const columns: NonNullable<TableProps<FamiliaTableRow>['columns']> = useMemo(() => {
    const base: NonNullable<TableProps<FamiliaTableRow>['columns']> = [
      {
        title: 'Família',
        dataIndex: 'familia',
        key: 'familia',
        sorter: true
      },
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
        render: (_: unknown, record: FamiliaTableRow) => record.action
      })
    }
    return base
  }, [canEdit])

  const handleChange: TableProps<FamiliaTableRow>['onChange'] = (pagination, _filters, sorter) => {
    const { nextSorter, sortChanged } = normalizeTaxonomiaTableSorterChange(lastSorter, sorter)

    onChange(
      pagination.current ?? 1,
      pagination.pageSize ?? 20,
      nextSorter,
      sortChanged
    )
  }

  return (
    <Table<FamiliaTableRow>
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

export default FamiliaTable
