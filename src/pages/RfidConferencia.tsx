import React, {
  useState, useEffect
} from 'react'

import {
  Row,
  Col,
  Divider,
  Card,
  Button,
  notification,
  Table,
  Tag,
  Input,
  Select,
  Form
} from 'antd'
import { TablePaginationConfig } from 'antd/es/table'
import moment from 'moment'
import { useTranslation } from 'react-i18next'

import { FiltrosVinculos, useRfidVinculos } from '@/features/rfid/useRfidVinculos'
import {
  SearchOutlined, ClearOutlined, ReloadOutlined, EditOutlined
} from '@ant-design/icons'

import RfidVinculoEdicao from '../components/rfid-conferencia/RfidVinculoEdicao'
import { RfidVinculo } from '../components/rfid-conferencia/types'

const { Option } = Select

const formatarDataHora = (data?: string) => (data ? moment(data).format('DD/MM/YYYY HH:mm:ss') : '-')

const RfidConferencia: React.FC = () => {
  const [form] = Form.useForm<FiltrosVinculos>()
  const { t } = useTranslation('rfid')

  const [vinculoEdicao, setVinculoEdicao] = useState<RfidVinculo | null>(null)
  const [consulta, setConsulta] = useState({
    pagina: 1, limite: 20, filtros: {} as FiltrosVinculos
  })
  const {
    data, loading, validating, error, refresh
  } = useRfidVinculos(consulta.pagina, consulta.limite, consulta.filtros)
  const dados = data?.dados ?? []
  const paginacao = {
    current: consulta.pagina,
    pageSize: consulta.limite,
    total: data?.meta.total ?? 0
  }

  useEffect(() => {
    if (error) {
      notification.error({
        message: t('common.error'),
        description: t('notifications.conferenceFetchFailure'),
        placement: 'topRight'
      })
    }
  }, [error, t])

  const requisitaDados = (pagina = 1, limite = 20, filtros: FiltrosVinculos = {}) => {
    if (pagina === consulta.pagina && limite === consulta.limite && JSON.stringify(filtros) === JSON.stringify(consulta.filtros)) {
      void refresh().catch(() => undefined)
    } else {
      setConsulta({
        pagina, limite, filtros
      })
    }
  }

  const handleTableChange = (pagination: TablePaginationConfig) => {
    const filtrosAtuais = consulta.filtros
    void requisitaDados(pagination.current, pagination.pageSize, filtrosAtuais)
  }

  const onFinish = (valores: FiltrosVinculos) => {
    void requisitaDados(1, paginacao.pageSize, valores)
  }

  const limparFiltros = () => {
    form.resetFields()
    void requisitaDados(1, 20, {})
  }

  const columns = [
    {
      title: t('conference.id'),
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: t('conference.tombo'),
      key: 'tombo_hcf',
      render: (_: unknown, record: RfidVinculo) => record.tombos_foto?.tombo_hcf || '-'
    },
    {
      title: t('conference.barcode'),
      key: 'codigo_barra',
      render: (_: unknown, record: RfidVinculo) => record.tombos_foto?.codigo_barra || '-'
    },
    {
      title: 'EPC',
      dataIndex: 'epc',
      key: 'epc'
    },
    {
      title: 'TID',
      dataIndex: 'tid',
      key: 'tid',
      render: (text: string) => text ? text : <span style={{ color: '#ccc' }}>N/A</span>
    },

    {
      title: t('conference.createdAt'),
      dataIndex: 'created_at',
      key: 'created_at',
      render: (data: string) => formatarDataHora(data)
    },

    {
      title: t('conference.updatedAt'),
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (data: string) => formatarDataHora(data)
    },

    {
      title: t('conference.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = status === 'CONCLUIDO' ? 'green' : status === 'FALHA' ? 'red' : 'default'
        return <Tag color={color}>{status}</Tag>
      }
    },
    {
      title: t('conferenceLists.actions'),
      key: 'acoes',
      render: (_: unknown, record: RfidVinculo) => (
        <Button icon={<EditOutlined aria-hidden />} onClick={() => setVinculoEdicao(record)}>
          {t('common.edit')}
        </Button>
      )
    }
  ]

  return (
    <div style={{ padding: '24px' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: '20px' }}>
        <Col xs={24} sm={18}>
          <h2 style={{ fontWeight: 200, margin: 0 }}>{t('conference.title')}</h2>
        </Col>
        <Col xs={24} sm={6} style={{ textAlign: 'right' }}>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => requisitaDados(paginacao.current, paginacao.pageSize, consulta.filtros)}
            loading={loading || validating}
          >
            {t('common.update')}
          </Button>
        </Col>
      </Row>

      <Divider dashed />

      <Card title={t('conference.filtersTitle')} bordered={false} style={{ marginBottom: '24px' }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12} md={6}>
              <Form.Item name="tombo_hcf" label={t('conference.tombo')}>
                <Input placeholder={t('conference.searchTombo')} allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item name="codigo_barra" label={t('conference.barcode')}>
                <Input placeholder={t('conference.searchBarcode')} allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item name="epc" label="EPC">
                <Input placeholder={t('conference.searchEpc')} allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item name="status" label={t('conference.statusReading')}>
                <Select placeholder={t('common.all')} allowClear>
                  <Option value="CONCLUIDO">{t('conference.completed')}</Option>
                  <Option value="FALHA">{t('conference.failed')}</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row justify="end" gutter={16} style={{ marginTop: 8 }}>
            <Col>
              <Button icon={<ClearOutlined />} onClick={limparFiltros}>
                {t('common.clear')}
              </Button>
            </Col>
            <Col>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />} loading={loading || validating}>
                {t('common.search')}
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card bordered={false}>
        <Table
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
          loading={loading || validating}
          onChange={handleTableChange}
          bordered
          size="middle"
          scroll={{ x: 'max-content' }}
        />
      </Card>
      {vinculoEdicao && (
        <RfidVinculoEdicao
          vinculo={vinculoEdicao}
          onCancel={() => setVinculoEdicao(null)}
          onSaved={() => {
            setVinculoEdicao(null)
            const pagina = Math.min(paginacao.current, Math.max(1, Math.ceil((paginacao.total - 1) / paginacao.pageSize)))
            void requisitaDados(pagina, paginacao.pageSize, consulta.filtros)
          }}
        />
      )}
    </div>
  )
}

export default RfidConferencia
