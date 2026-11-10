import React, {
  useCallback, useEffect, useState
} from 'react'

import {
  Button, Card, Col, DatePicker, Descriptions, Divider, Drawer, Form, List, notification, Row, Select, Space, Table, Tag
} from 'antd'
import axios from 'axios'
import moment, { Moment } from 'moment'
import { useTranslation } from 'react-i18next'

import {
  ArrowLeftOutlined, ClearOutlined, EyeOutlined, ReloadOutlined, SearchOutlined
} from '@ant-design/icons'

import { RouterProps, withRouter } from '../libraries/router/withRouter'

const { RangePicker } = DatePicker
const { Option } = Select

interface ListaConferencia {
  id: number
  nome: string
  descricao?: string | null
}

interface InventarioStatus {
  encontrados?: string[]
  nao_encontrados?: string[]
  tids_invalidos?: string[]
}

interface TidDetalhado {
  tid: string
  rfid_id?: number
  tombo_foto_id?: number
  tombo_hcf?: number | string | null
  codigo_barra?: string | null
  caminho_foto?: string | null
}

interface InventarioLista {
  id: number
  lista_conferencia_id: number
  usuario_id?: number | null
  total_esperado: number
  total_encontrados: number
  total_nao_encontrados: number
  status: InventarioStatus
  status_detalhado?: {
    encontrados?: TidDetalhado[]
    nao_encontrados?: TidDetalhado[]
    tids_invalidos?: TidDetalhado[]
  }
  created_at: string
}

interface InventariosResponse {
  dados: InventarioLista[]
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

const formatarDataHora = (data?: string) => (data ? moment(data).format('DD/MM/YYYY HH:mm:ss') : '-')

const normalizarTidsDetalhados = (tids: TidDetalhado[] | string[] | undefined): TidDetalhado[] => {
  if (!tids) return []

  return tids.map(tid => (typeof tid === 'string' ? { tid } : tid))
}

const renderListaTids = (tids: TidDetalhado[] | string[] | undefined, emptyText: string) => {
  const tidsDetalhados = normalizarTidsDetalhados(tids)

  if (tidsDetalhados.length === 0) {
    return <span style={{ color: 'rgba(0, 0, 0, 0.45)' }}>{emptyText}</span>
  }

  return (
    <List
      size="small"
      bordered
      dataSource={tidsDetalhados}
      renderItem={item => (
        <List.Item>
          {item.tombo_hcf
            ? (
              <a
                href={`/tombos/detalhes/${item.tombo_hcf}`}
                target="_blank"
                rel="noreferrer"
                style={{ fontFamily: 'monospace' }}
              >
                {item.tid}
              </a>
            )
            : (
              <span style={{ fontFamily: 'monospace' }}>{item.tid}</span>
            )}
          {item.codigo_barra && (
            <span style={{ marginLeft: 8, color: 'rgba(0, 0, 0, 0.45)' }}>
              {item.codigo_barra}
            </span>
          )}
        </List.Item>
      )}
    />
  )
}

const RfidListaConferenciaInventarios: React.FC<RouterProps> = ({ history, match }) => {
  const [form] = Form.useForm()
  const { t } = useTranslation('rfid')
  const id = match.params.id
  const [lista, setLista] = useState<ListaConferencia | null>(null)
  const [inventarios, setInventarios] = useState<InventarioLista[]>([])
  const [inventarioSelecionado, setInventarioSelecionado] = useState<InventarioLista | null>(null)
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

  const carregarLista = useCallback(async () => {
    if (!id) return

    try {
      const response = await axios.get<ListaConferencia>(`/rfids/listas_conferencias/${id}`)
      setLista(response.data)
    } catch (error) {
      notificacao('error', t('common.error'), t('conferenceLists.listFetchFailure'))
    }
  }, [id, t])

  const montarFiltros = (values: { periodo?: [Moment, Moment]; ordem?: string }) => {
    const params: Record<string, string> = {}

    if (values.periodo?.[0]) {
      params.data_inicio = values.periodo[0].startOf('day').toISOString()
    }

    if (values.periodo?.[1]) {
      params.data_fim = values.periodo[1].endOf('day').toISOString()
    }

    if (values.ordem) {
      params.ordem = values.ordem
    }

    return params
  }

  const requisitaDados = useCallback(async (pagina = 1, limite = 20, filtros = {}) => {
    if (!id) return

    setLoading(true)

    try {
      const response = await axios.get<InventariosResponse>(`/rfids/listas_conferencias/${id}/inventarios`, {
        params: {
          pagina,
          limite,
          ordem: 'DESC',
          ...filtros
        }
      })

      const { dados, meta } = response.data

      setInventarios(dados)
      setPaginacao({
        current: meta.pagina,
        pageSize: meta.limite,
        total: meta.total
      })
    } catch (error) {
      notificacao('error', t('common.error'), t('conferenceLists.inventoriesFetchFailure'))
    } finally {
      setLoading(false)
    }
  }, [id, t])

  useEffect(() => {
    void carregarLista()
    void requisitaDados(1, 20)
  }, [carregarLista, requisitaDados])

  const handleTableChange = (pagination: PaginationLike) => {
    void requisitaDados(
      pagination.current,
      pagination.pageSize,
      montarFiltros(form.getFieldsValue() as { periodo?: [Moment, Moment]; ordem?: string })
    )
  }

  const onFinish = (values: { periodo?: [Moment, Moment]; ordem?: string }) => {
    void requisitaDados(1, paginacao.pageSize, montarFiltros(values))
  }

  const limparFiltros = () => {
    form.resetFields()
    void requisitaDados(1, 20)
  }

  const columns = [
    {
      title: t('conferenceLists.inventoryDate'),
      dataIndex: 'created_at',
      key: 'created_at',
      width: 175,
      align: 'center' as const,
      render: (data: string) => formatarDataHora(data)
    },
    {
      title: t('conferenceLists.expectedTotal'),
      dataIndex: 'total_esperado',
      key: 'total_esperado',
      width: 150
    },
    {
      title: t('conferenceLists.foundTotal'),
      dataIndex: 'total_encontrados',
      key: 'total_encontrados',
      width: 150,
      render: (total: number) => <Tag color="green">{total}</Tag>
    },
    {
      title: t('conferenceLists.missingTotal'),
      dataIndex: 'total_nao_encontrados',
      key: 'total_nao_encontrados',
      width: 170,
      render: (total: number) => <Tag color={total > 0 ? 'red' : 'green'}>{total}</Tag>
    },
    {
      title: t('conferenceLists.invalidTids'),
      key: 'tids_invalidos',
      width: 150,
      render: (_: unknown, record: InventarioLista) => <Tag>{record.status?.tids_invalidos?.length || 0}</Tag>
    },
    {
      title: t('conferenceLists.actions'),
      key: 'actions',
      width: 120,
      render: (_: unknown, record: InventarioLista) => (
        <Button icon={<EyeOutlined />} onClick={() => setInventarioSelecionado(record)}>
          {t('conferenceLists.analyze')}
        </Button>
      )
    }
  ]

  return (
    <div style={{ padding: '24px' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: '20px' }}>
        <Col>
          <h2 style={{ fontWeight: 200, margin: 0 }}>{t('conferenceLists.inventoriesTitle')}</h2>
          {lista && <span style={{ color: 'rgba(0, 0, 0, 0.45)' }}>{lista.nome}</span>}
        </Col>
        <Col>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => void requisitaDados(
                paginacao.current,
                paginacao.pageSize,
                montarFiltros(form.getFieldsValue() as { periodo?: [Moment, Moment]; ordem?: string })
              )}
              loading={loading}
            >
              {t('common.update')}
            </Button>
            <Button icon={<ArrowLeftOutlined />} onClick={() => history.push('/rfid-listas-conferencia')}>
              {t('conferenceLists.backToLists')}
            </Button>
          </Space>
        </Col>
      </Row>

      <Divider dashed />

      <Card title={t('conferenceLists.inventoryFilters')} bordered={false} style={{ marginBottom: 24 }}>
        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ ordem: 'DESC' }}>
          <Row gutter={16} align="bottom">
            <Col xs={24} md={12}>
              <Form.Item name="periodo" label={t('conferenceLists.period')}>
                <RangePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item name="ordem" label={t('conferenceLists.order')}>
                <Select>
                  <Option value="DESC">{t('conferenceLists.newestFirst')}</Option>
                  <Option value="ASC">{t('conferenceLists.oldestFirst')}</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={6} style={{ textAlign: 'right' }}>
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
          dataSource={inventarios}
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

      <Drawer
        title={t('conferenceLists.inventoryAnalysis')}
        width={720}
        visible={Boolean(inventarioSelecionado)}
        onClose={() => setInventarioSelecionado(null)}
      >
        {inventarioSelecionado && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Descriptions bordered size="small" column={1}>
              <Descriptions.Item label={t('conferenceLists.inventoryDate')}>
                {formatarDataHora(inventarioSelecionado.created_at)}
              </Descriptions.Item>
              <Descriptions.Item label={t('conferenceLists.expectedTotal')}>
                {inventarioSelecionado.total_esperado}
              </Descriptions.Item>
              <Descriptions.Item label={t('conferenceLists.foundTotal')}>
                {inventarioSelecionado.total_encontrados}
              </Descriptions.Item>
              <Descriptions.Item label={t('conferenceLists.missingTotal')}>
                {inventarioSelecionado.total_nao_encontrados}
              </Descriptions.Item>
            </Descriptions>

            <Card title={t('conferenceLists.foundTids')} size="small">
              {renderListaTids(
                inventarioSelecionado.status_detalhado?.encontrados || inventarioSelecionado.status?.encontrados,
                t('conferenceLists.noFoundTids')
              )}
            </Card>

            <Card title={t('conferenceLists.missingTids')} size="small">
              {renderListaTids(
                inventarioSelecionado.status_detalhado?.nao_encontrados || inventarioSelecionado.status?.nao_encontrados,
                t('conferenceLists.noMissingTids')
              )}
            </Card>

            <Card title={t('conferenceLists.invalidTids')} size="small">
              {renderListaTids(
                inventarioSelecionado.status_detalhado?.tids_invalidos || inventarioSelecionado.status?.tids_invalidos,
                t('conferenceLists.noInvalidTids')
              )}
            </Card>
          </Space>
        )}
      </Drawer>
    </div>
  )
}

export default withRouter(RfidListaConferenciaInventarios)
