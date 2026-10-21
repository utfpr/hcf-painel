import React from 'react'

import {
  Card, Image, Space, Table, Tag
} from 'antd'
import { useTranslation } from 'react-i18next'

import { fotosBaseUrl } from '../../config/api'
import { PaginacaoRfids, RfidVinculo } from './types'

interface Props {
  titulo: string
  dados: RfidVinculo[]
  paginacao: PaginacaoRfids
  loading: boolean
  contador: string
  onPageChange: (pagina: number, limite: number) => void
  acoes?: React.ReactNode
  selecionados?: React.Key[]
  onSelectionChange?: (ids: React.Key[]) => void
  style?: React.CSSProperties
}

const URL_NAO_ENCONTRADA = 'https://hcf.cm.utfpr.edu.br/not-found.jpg'

const getTomboFoto = (record: RfidVinculo) => record.tombos_foto || record.TomboFoto

const montarUrlFoto = (record: RfidVinculo): string => {
  const tomboFoto = getTomboFoto(record)
  const codigoBarra = tomboFoto?.codigo_barra?.trim()
  const identificadorFoto = tomboFoto?.caminho_foto?.trim() || (codigoBarra ? codigoBarra + '.JPG' : '')

  if (!identificadorFoto) return URL_NAO_ENCONTRADA

  const baseUrl = fotosBaseUrl?.replace(/\/$/, '')

  if (!baseUrl) return URL_NAO_ENCONTRADA

  return baseUrl + '/' + identificadorFoto + '/resize?height=1800'
}

const RfidListaConferenciaTabela: React.FC<Props> = ({
  titulo,
  dados,
  paginacao,
  loading,
  contador,
  onPageChange,
  acoes,
  selecionados,
  onSelectionChange,
  style
}) => {
  const { t } = useTranslation('rfid')
  const columns = [
    {
      title: t('conference.tombo'),
      key: 'tombo_hcf',
      render: (_: unknown, record: RfidVinculo) => getTomboFoto(record)?.tombo_hcf || t('common.dash')
    },
    {
      title: t('conference.barcode'),
      key: 'codigo_barra',
      render: (_: unknown, record: RfidVinculo) => getTomboFoto(record)?.codigo_barra || t('common.dash')
    },
    {
      title: 'EPC',
      dataIndex: 'epc',
      key: 'epc',
      render: (epc?: string) => epc || t('common.dash')
    },
    {
      title: 'TID',
      dataIndex: 'tid',
      key: 'tid',
      render: (tid?: string | null) => tid || <span style={{ color: '#ccc' }}>{t('common.none')}</span>
    },
    {
      title: t('conferenceLists.photo'),
      key: 'foto',
      width: 130,
      render: (_: unknown, record: RfidVinculo) => (
        <Image
          width={64}
          height={64}
          src={montarUrlFoto(record)}
          alt={getTomboFoto(record)?.codigo_barra || t('conferenceLists.photo')}
          fallback={URL_NAO_ENCONTRADA}
          style={{ objectFit: 'cover' }}
        />
      )
    }
  ]

  return (
    <Card
      title={titulo}
      bordered={false}
      style={style}
      extra={(
        <Space>
          <Tag color="blue">{contador}</Tag>
          {acoes}
        </Space>
      )}
    >
      <Table
        rowSelection={onSelectionChange && {
          selectedRowKeys: selecionados,
          preserveSelectedRowKeys: true,
          onChange: onSelectionChange
        }}
        columns={columns}
        dataSource={dados}
        rowKey="id"
        pagination={{
          ...paginacao,
          showSizeChanger: true,
          showTotal: (total, range) => t('conference.totalRecords', {
            start: range[0], end: range[1], total
          })
        }}
        loading={loading}
        onChange={pagination => onPageChange(pagination.current || 1, pagination.pageSize || 20)}
        bordered
        size="middle"
      />
    </Card>
  )
}

export default RfidListaConferenciaTabela
