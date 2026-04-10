import React, { useMemo } from 'react'

import type { TableProps } from 'antd'
import { Table } from 'antd'

import { taxonomiaPaginationLocale } from '@/features/taxonomia-shared/utils/tablePaginationLocale'
import { normalizeTaxonomiaTableSorterChange } from '@/features/taxonomia-shared/utils/tableSorter'
import { EditOutlined } from '@ant-design/icons'

import type {
  Especie, EspecieMetadata, EspecieSorter, EspecieTableRow
} from '../types'

export interface EspecieTableProps {
  especies: Especie[]
  metadata: Partial<EspecieMetadata>
  page: number
  pageSize: number
  loading: boolean
  lastSorter: EspecieSorter | undefined
  canEdit: boolean
  onEdit: (especie: Especie) => void
  onChange: (
    page: number,
    pageSize: number,
    sorter: EspecieSorter | undefined,
    sortChanged: boolean
  ) => void
}

const EspecieTable: React.FC<EspecieTableProps> = ({
  especies,
  metadata,
  page,
  pageSize,
  loading,
  lastSorter,
  canEdit,
  onEdit,
  onChange
}) => {
  const dataSource = useMemo<EspecieTableRow[]>(
    () =>
      especies.map(item => ({
        key: item.id,
        especie: item.nome,
        familia: item.genero?.familia?.nome ?? '',
        genero: item.genero?.nome ?? '',
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
              aria-label={`Editar espécie ${item.nome}`}
            >
              <EditOutlined style={{ color: '#FFCC00' }} />
            </button>
          )
          : undefined
      })),
    [
      canEdit,
      onEdit,
      especies
    ]
  )

  const columns: NonNullable<TableProps<EspecieTableRow>['columns']> = useMemo(() => {
    const base: NonNullable<TableProps<EspecieTableRow>['columns']> = [
      {
        title: 'Espécie',
        dataIndex: 'especie',
        key: 'especie',
        sorter: true
      },
      {
        title: 'Família',
        dataIndex: 'familia',
        key: 'familia',
        sorter: true
      },
      {
        title: 'Gênero',
        dataIndex: 'genero',
        key: 'genero',
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
        render: (_: unknown, record: EspecieTableRow) => record.action
      })
    }
    return base
  }, [canEdit])

  const handleChange: TableProps<EspecieTableRow>['onChange'] = (pagination, _filters, sorter) => {
    const { nextSorter, sortChanged } = normalizeTaxonomiaTableSorterChange(lastSorter, sorter)

    onChange(
      pagination.current ?? 1,
      pagination.pageSize ?? 20,
      nextSorter,
      sortChanged
    )
  }

  return (
    <Table<EspecieTableRow>
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

export default EspecieTable
