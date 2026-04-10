import React, { useMemo } from 'react'

import type { TableProps } from 'antd'
import { Table } from 'antd'

import { taxonomiaPaginationLocale } from '@/features/taxonomia-shared/utils/tablePaginationLocale'
import { normalizeTaxonomiaTableSorterChange } from '@/features/taxonomia-shared/utils/tableSorter'
import { EditOutlined } from '@ant-design/icons'

import type {
  Subfamilia, SubfamiliaMetadata, SubfamiliaSorter, SubfamiliaTableRow
} from '../types'

export interface SubfamiliaTableProps {
  subfamilias: Subfamilia[]
  metadata: Partial<SubfamiliaMetadata>
  page: number
  pageSize: number
  loading: boolean
  lastSorter: SubfamiliaSorter | undefined
  canEdit: boolean
  onEdit: (subfamilia: Subfamilia) => void
  onChange: (
    page: number,
    pageSize: number,
    sorter: SubfamiliaSorter | undefined,
    sortChanged: boolean
  ) => void
}

const SubfamiliaTable: React.FC<SubfamiliaTableProps> = ({
  subfamilias,
  metadata,
  page,
  pageSize,
  loading,
  lastSorter,
  canEdit,
  onEdit,
  onChange
}) => {
  const dataSource = useMemo<SubfamiliaTableRow[]>(
    () =>
      subfamilias.map(item => ({
        key: item.id,
        subfamilia: item.nome,
        familia: item.familia?.nome ?? '',
        autor: item.autor?.nome ?? '',
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
              aria-label={`Editar subfamília ${item.nome}`}
            >
              <EditOutlined style={{ color: '#FFCC00' }} />
            </button>
          )
          : undefined
      })),
    [
      canEdit,
      onEdit,
      subfamilias
    ]
  )

  const columns: NonNullable<TableProps<SubfamiliaTableRow>['columns']> = useMemo(() => {
    const base: NonNullable<TableProps<SubfamiliaTableRow>['columns']> = [
      {
        title: 'Subfamília',
        dataIndex: 'subfamilia',
        key: 'subfamilia',
        sorter: true
      },
      {
        title: 'Família',
        dataIndex: 'familia',
        key: 'familia',
        sorter: true
      },
      {
        title: 'Autor',
        dataIndex: 'autor',
        key: 'autor',
        sorter: true
      }
    ]
    if (canEdit) {
      base.push({
        title: 'Ação',
        dataIndex: 'action',
        key: 'action',
        width: 50,
        render: (_: unknown, record: SubfamiliaTableRow) => record.action
      })
    }
    return base
  }, [canEdit])

  const handleChange: TableProps<SubfamiliaTableRow>['onChange'] = (pagination, _filters, sorter) => {
    const { nextSorter, sortChanged } = normalizeTaxonomiaTableSorterChange(lastSorter, sorter)

    onChange(
      pagination.current ?? 1,
      pagination.pageSize ?? 20,
      nextSorter,
      sortChanged
    )
  }

  return (
    <Table<SubfamiliaTableRow>
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

export default SubfamiliaTable
