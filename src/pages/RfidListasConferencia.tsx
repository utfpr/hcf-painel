import React, {
  useCallback, useEffect, useState
} from 'react'

import {
  Button, Card, Col, Divider, Form, Input, notification, Row, Space, Table
} from 'antd'
import axios from 'axios'
import { useTranslation } from 'react-i18next'

import {
  ClearOutlined, EditOutlined, FileSearchOutlined, PlusOutlined, ReloadOutlined, SearchOutlined
} from '@ant-design/icons'

import { RouterProps, withRouter } from '../libraries/router/withRouter'

interface ListaConferencia {
  id: number
  nome: string
  descricao?: string | null
}

interface ListasConferenciaResponse {
  dados: ListaConferencia[]
  meta: {
    total: number
    pagina: number
    limite: number
  }
}

interface PaginationLike {
  current?: number
  pageSize?: number
}

const RfidListasConferencia: React.FC<RouterProps> = ({ history }) => {
  const [form] = Form.useForm()
  const { t } = useTranslation('rfid')
  const [dados, setDados] = useState<ListaConferencia[]>([])
  const [loading, setLoading] = useState(false)
  const [paginacao, setPaginacao] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  })

  const notificacao = (type: 'success' | 'warning' | 'error' | 'info', titulo: string, descricao: string) => {
    notification[type]({
      message: titulo,
      description: descricao,
      placement: 'topRight'
    })
  }

  const requisitaDados = useCallback(async (pagina = 1, limite = 20, filtros = {}) => {
    setLoading(true)

    try {
      const response = await axios.get<ListasConferenciaResponse>('/rfids/listas_conferencias', {
        params: {
          pagina,
          limite,
          ...filtros
        }
      })

      const { dados: listas, meta } = response.data

      setDados(listas)
      setPaginacao({
        current: meta.pagina,
        pageSize: meta.limite,
        total: meta.total
      })
    } catch (error) {
      notificacao('error', t('common.error'), t('conferenceLists.fetchFailure'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    void requisitaDados(1, 20)
  }, [requisitaDados])

  const handleTableChange = (pagination: PaginationLike) => {
    void requisitaDados(pagination.current, pagination.pageSize, form.getFieldsValue() as { nome?: string })
  }

  const onFinish = (values: { nome?: string }) => {
    void requisitaDados(1, paginacao.pageSize, values)
  }

  const limparFiltros = () => {
    form.resetFields()
    void requisitaDados(1, 20)
  }

  const columns = [
    {
      title: t('conferenceLists.id'),
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: t('conferenceLists.name'),
      dataIndex: 'nome',
      key: 'nome'
    },
    {
      title: t('conferenceLists.description'),
      dataIndex: 'descricao',
      key: 'descricao',
      render: (descricao?: string | null) => descricao || t('common.dash')
    },
    {
      title: t('conferenceLists.actions'),
      key: 'actions',
      width: 260,
      render: (_: unknown, record: ListaConferencia) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => history.push(`/rfid-listas-conferencia/${record.id}`)}>
            {t('common.edit')}
          </Button>
          <Button
            icon={<FileSearchOutlined />}
            onClick={() => history.push(`/rfid-listas-conferencia/${record.id}/inventarios`)}
          >
            {t('conferenceLists.inventories')}
          </Button>
        </Space>
      )
    }
  ]

  return (
    <div style={{ padding: '24px' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: '20px' }}>
        <Col xs={24} sm={16}>
          <h2 style={{ fontWeight: 200, margin: 0 }}>{t('conferenceLists.title')}</h2>
        </Col>
        <Col xs={24} sm={8} style={{ textAlign: 'right' }}>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => void requisitaDados(
                paginacao.current,
                paginacao.pageSize,
                form.getFieldsValue() as { nome?: string }
              )}
              loading={loading}
            >
              {t('common.update')}
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => history.push('/rfid-listas-conferencia/novo')}>
              {t('conferenceLists.newList')}
            </Button>
          </Space>
        </Col>
      </Row>

      <Divider dashed />

      <Card title={t('conferenceLists.filtersTitle')} bordered={false} style={{ marginBottom: '24px' }}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Row gutter={16} align="bottom">
            <Col xs={24} md={12}>
              <Form.Item name="nome" label={t('conferenceLists.name')}>
                <Input placeholder={t('conferenceLists.searchName')} allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} md={12} style={{ textAlign: 'right' }}>
              <Space style={{ marginBottom: 24 }}>
                <Button icon={<ClearOutlined />} onClick={limparFiltros}>
                  {t('common.clear')}
                </Button>
                <Button type="primary" htmlType="submit" icon={<SearchOutlined />} loading={loading}>
                  {t('common.search')}
                </Button>
              </Space>
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
            showTotal: (total, range) => t('conferenceLists.totalRecords', {
              start: range[0], end: range[1], total
            })
          }}
          loading={loading}
          onChange={handleTableChange}
          bordered
          size="middle"
        />
      </Card>
    </div>
  )
}

export default withRouter(RfidListasConferencia)
