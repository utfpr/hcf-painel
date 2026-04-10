import React, { useMemo } from 'react'

import type { TableProps } from 'antd'
import { Table } from 'antd'
import { Link } from 'react-router-dom'

import { taxonomiaPaginationLocale } from '@/features/taxonomia-shared/utils/tablePaginationLocale'
import { EditOutlined } from '@ant-design/icons'

import type {
  TaxonomiaListItem, TaxonomiaMetadata, TaxonomiaTableRow
} from '../types'

export interface TaxonomiaScreenTableProps {
  taxonomias: TaxonomiaListItem[]
  metadata: Partial<TaxonomiaMetadata>
  page: number
  pageSize: number
  loading: boolean
  onChange: (page: number, pageSize: number) => void
}

const TaxonomiaScreenTable: React.FC<TaxonomiaScreenTableProps> = ({
  taxonomias,
  metadata,
  page,
  pageSize,
  loading,
  onChange
}) => {
  const dataSource = useMemo<TaxonomiaTableRow[]>(
    () =>
      taxonomias.map(item => ({
        key: item.hcf,
        familia: item.familia,
        subfamilia: item.sub_familia,
        genero: item.genero,
        especie: item.especie,
        subespecie: item.sub_especie,
        variedade: item.variedade,
        acao: (
          <Link to={`/taxonomias/${item.hcf}`} aria-label="Editar taxonomia">
            <EditOutlined style={{ color: '#FFCC00' }} />
          </Link>
        )
      })),
    [taxonomias]
  )

  const columns: NonNullable<TableProps<TaxonomiaTableRow>['columns']> = useMemo(
    () => [
      {
        title: 'Família',
        dataIndex: 'familia',
        key: 'familia'
      },
      {
        title: 'Subfamília',
        dataIndex: 'subfamilia',
        key: 'subfamilia'
      },
      {
        title: 'Gênero',
        dataIndex: 'genero',
        key: 'genero'
      },
      {
        title: 'Espécie',
        dataIndex: 'especie',
        key: 'especie'
      },
      {
        title: 'Subespécie',
        dataIndex: 'subespecie',
        key: 'subespecie'
      },
      {
        title: 'Variedades',
        dataIndex: 'variedade',
        key: 'variedade'
      },
      {
        title: 'Ação',
        dataIndex: 'acao',
        key: 'acao',
        width: 80,
        render: (_: unknown, record: TaxonomiaTableRow) => record.acao
      }
    ],
    []
  )

  const handleChange: TableProps<TaxonomiaTableRow>['onChange'] = pagination => {
    onChange(pagination.current ?? 1, pagination.pageSize ?? 20)
  }

  return (
    <Table<TaxonomiaTableRow>
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

export default TaxonomiaScreenTable
