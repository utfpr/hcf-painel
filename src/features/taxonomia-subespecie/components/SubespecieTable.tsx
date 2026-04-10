import React, { useMemo } from 'react'

import type { TableProps } from 'antd'
import { Table } from 'antd'

import { taxonomiaPaginationLocale } from '@/features/taxonomia-shared/utils/tablePaginationLocale'
import { normalizeTaxonomiaTableSorterChange } from '@/features/taxonomia-shared/utils/tableSorter'
import { EditOutlined } from '@ant-design/icons'

import type {
  Subespecie, SubespecieMetadata, SubespecieSorter, SubespecieTableRow
} from '../types'

export interface SubespecieTableProps {
  subespecies: Subespecie[]
  metadata: Partial<SubespecieMetadata>
  page: number
  pageSize: number
  loading: boolean
  lastSorter: SubespecieSorter | undefined
  canEdit: boolean
  onEdit: (subespecie: Subespecie) => void
  onChange: (
    page: number,
    pageSize: number,
    sorter: SubespecieSorter | undefined,
    sortChanged: boolean
  ) => void
}

const SubespecieTable: React.FC<SubespecieTableProps> = ({
  subespecies,
  metadata,
  page,
  pageSize,
  loading,
  lastSorter,
  canEdit,
  onEdit,
  onChange
}) => {
  const dataSource = useMemo<SubespecieTableRow[]>(
    () =>
      subespecies.map(item => ({
        key: item.id,
        subespecie: item.nome,
        especie: item.especie?.nome ?? '',
        familia: item.especie?.genero?.familia?.nome ?? '',
        genero: item.especie?.genero?.nome ?? '',
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
              aria-label={`Editar subespécie ${item.nome}`}
            >
              <EditOutlined style={{ color: '#FFCC00' }} />
            </button>
          )
          : undefined
      })),
    [
      canEdit,
      onEdit,
      subespecies
    ]
  )

  const columns: NonNullable<TableProps<SubespecieTableRow>['columns']> = useMemo(() => {
    const base: NonNullable<TableProps<SubespecieTableRow>['columns']> = [
      {
        title: 'Subespécie',
        dataIndex: 'subespecie',
        key: 'subespecie',
        sorter: true
      },
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
        render: (_: unknown, record: SubespecieTableRow) => record.action
      })
    }
    return base
  }, [canEdit])

  const handleChange: TableProps<SubespecieTableRow>['onChange'] = (pagination, _filters, sorter) => {
    const { nextSorter, sortChanged } = normalizeTaxonomiaTableSorterChange(lastSorter, sorter)

    onChange(
      pagination.current ?? 1,
      pagination.pageSize ?? 20,
      nextSorter,
      sortChanged
    )
  }

  return (
    <Table<SubespecieTableRow>
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

export default SubespecieTable
