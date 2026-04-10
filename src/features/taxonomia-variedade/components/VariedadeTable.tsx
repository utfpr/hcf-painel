import React, { useMemo } from 'react'

import type { TableProps } from 'antd'
import { Table } from 'antd'

import { taxonomiaPaginationLocale } from '@/features/taxonomia-shared/utils/tablePaginationLocale'
import { normalizeTaxonomiaTableSorterChange } from '@/features/taxonomia-shared/utils/tableSorter'
import { EditOutlined } from '@ant-design/icons'

import type {
  Variedade, VariedadeMetadata, VariedadeSorter, VariedadeTableRow
} from '../types'

export interface VariedadeTableProps {
  variedades: Variedade[]
  metadata: Partial<VariedadeMetadata>
  page: number
  pageSize: number
  loading: boolean
  lastSorter: VariedadeSorter | undefined
  canEdit: boolean
  onEdit: (variedade: Variedade) => void
  onChange: (
    page: number,
    pageSize: number,
    sorter: VariedadeSorter | undefined,
    sortChanged: boolean
  ) => void
}

const VariedadeTable: React.FC<VariedadeTableProps> = ({
  variedades,
  metadata,
  page,
  pageSize,
  loading,
  lastSorter,
  canEdit,
  onEdit,
  onChange
}) => {
  const dataSource = useMemo<VariedadeTableRow[]>(
    () =>
      variedades.map(item => ({
        key: item.id,
        variedade: item.nome,
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
              aria-label={`Editar variedade ${item.nome}`}
            >
              <EditOutlined style={{ color: '#FFCC00' }} />
            </button>
          )
          : undefined
      })),
    [
      canEdit,
      onEdit,
      variedades
    ]
  )

  const columns: NonNullable<TableProps<VariedadeTableRow>['columns']> = useMemo(() => {
    const base: NonNullable<TableProps<VariedadeTableRow>['columns']> = [
      {
        title: 'Variedade',
        dataIndex: 'variedade',
        key: 'variedade',
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
        render: (_: unknown, record: VariedadeTableRow) => record.action
      })
    }
    return base
  }, [canEdit])

  const handleChange: TableProps<VariedadeTableRow>['onChange'] = (pagination, _filters, sorter) => {
    const { nextSorter, sortChanged } = normalizeTaxonomiaTableSorterChange(lastSorter, sorter)

    onChange(
      pagination.current ?? 1,
      pagination.pageSize ?? 20,
      nextSorter,
      sortChanged
    )
  }

  return (
    <Table<VariedadeTableRow>
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

export default VariedadeTable
