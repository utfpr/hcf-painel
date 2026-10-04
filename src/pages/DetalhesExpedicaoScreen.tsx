import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router'
import {
  Row,
  Col,
  Divider,
  Tag,
  Button,
  Space,
  Modal,
  notification,
  Select,
  Alert,
  List,
  Spin,
  Empty,
  Typography
} from 'antd'
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CompassOutlined,
  ReloadOutlined,
  PaperClipOutlined
} from '@ant-design/icons'
import axios from 'axios'
import moment from 'moment'

const { Option } = Select
const { Title, Text, Paragraph } = Typography

export type StatusExpedicao = 'realizada' | 'futura' | 'em_andamento'

export interface ParticipanteExpedicao {
  id: number | string
  nome: string
  email?: string
  funcao?: string
}

export interface ParadaRota {
  id: number | string
  ordem?: number
  nome: string
  descricao?: string
}

export interface EvidenciaArquivo {
  id: number
  nome: string
  url: string
  mime_type?: string
  tamanho?: number
}

export interface RegistroEventoExpedicao {
  id: number
  tipo: string
  titulo: string
  dataHora: string
  conteudo?: string
  coleta?: {
    familia?: string | null
    nome_popular?: string | null
    nome_cientifico?: string | null
  } | null
  arquivos?: EvidenciaArquivo[]
}

export interface ExpedicaoDetalhesModel {
  id: number
  titulo: string
  descricao: string
  status: StatusExpedicao
  dataInicio: string
  dataFim: string
  destino: string
  participantes: ParticipanteExpedicao[]
  rotas: ParadaRota[]
  evidencias: RegistroEventoExpedicao[]
}

const getStatusTag = (status: StatusExpedicao) => {
  switch (status) {
    case 'realizada':
      return (
        <Tag color="success" icon={<CheckCircleOutlined />}>
          Realizada
        </Tag>
      )
    case 'futura':
      return (
        <Tag color="processing" icon={<ClockCircleOutlined />}>
          Planejada / Futura
        </Tag>
      )
    case 'em_andamento':
      return (
        <Tag color="warning" icon={<CompassOutlined />}>
          Em Andamento
        </Tag>
      )
    default:
      return null
  }
}

export default function DetalhesExpedicaoScreen() {
  const { id: paramId } = useParams<{ id?: string }>()
  const navigate = useNavigate()

  const [expedicoesLista, setExpedicoesLista] = useState<Array<{ id: number; titulo: string; status?: StatusExpedicao }>>([])
  const [expedicaoAtual, setExpedicaoAtual] = useState<ExpedicaoDetalhesModel | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [erroApi, setErroApi] = useState<string | null>(null)

  const carregarDetalhes = useCallback(async (id: number) => {
    try {
      setLoading(true)
      const res = await axios.get(`/v2/expedicoes/${id}`)
      const raw = res.data

      const hoje = new Date()
      const dataInicio = new Date(raw.data_inicio)
      const dataFim = new Date(raw.data_fim)

      let status: StatusExpedicao = 'realizada'
      if (hoje < dataInicio) {
        status = 'futura'
      } else if (hoje <= dataFim) {
        status = 'em_andamento'
      }

      const destino =
        raw.rotas?.find((r: any) => r.cidade_id === raw.cidade_id)?.nome_cidade ||
        raw.rotas?.[0]?.nome_cidade ||
        raw.cidade_nome ||
        'Destino não informado'

      const participantes: ParticipanteExpedicao[] = (raw.participantes || []).map((p: any, idx: number) => ({
        id: p.id,
        nome: p.nome,
        email: p.email,
        funcao: idx === 0 ? 'Coordenador' : 'Pesquisador'
      }))

      const rotas: ParadaRota[] = (raw.rotas || []).map((r: any, idx: number) => ({
        id: r.cidade_id || idx + 1,
        ordem: idx + 1,
        nome: r.nome_cidade || `Cidade #${r.cidade_id}`,
        descricao: 'Cidade de itinerário da expedição'
      }))

      // Busca eventos/evidências caso existam
      let evidencias: RegistroEventoExpedicao[] = []
      try {
        const resEventos = await axios.get(`/v2/expedicoes/${id}/eventos`)
        const itensEventos = resEventos.data?.itens || []

        evidencias = await Promise.all(
          itensEventos.map(async (ev: any) => {
            let arquivos: EvidenciaArquivo[] = []
            try {
              const resEvidencias = await axios.get(`/v2/eventos/${ev.id}/evidencias`)
              arquivos = resEvidencias.data || []
            } catch {
              arquivos = []
            }

            let titulo = ev.observacoes || `Evento #${ev.id}`
            if (ev.tipo === 'COLETA') {
              const partes = []
              if (ev.coleta?.nome_cientifico) partes.push(ev.coleta.nome_cientifico)
              if (ev.coleta?.nome_popular) partes.push(`(${ev.coleta.nome_popular})`)
              if (partes.length > 0) {
                titulo = partes.join(' ')
              } else {
                titulo = 'Coleta Botânica'
              }
            } else if (ev.tipo === 'DIARIO') {
              titulo = 'Diário de Campo'
            }

            return {
              id: ev.id,
              tipo: ev.tipo || 'EVENTO',
              titulo,
              dataHora: ev.capturado_em || new Date().toISOString(),
              conteudo: ev.observacoes,
              coleta: ev.coleta,
              arquivos
            }
          })
        )
      } catch {
        evidencias = []
      }

      setExpedicaoAtual({
        id: raw.id,
        titulo: raw.descricao || `Expedição #${raw.id}`,
        descricao: raw.descricao || 'Sem descrição cadastrada.',
        status,
        dataInicio: raw.data_inicio,
        dataFim: raw.data_fim,
        destino,
        participantes,
        rotas,
        evidencias
      })
      setErroApi(null)
    } catch (err: any) {
      console.warn('Falha ao carregar detalhes da expedição:', err)
      const msg = err?.response?.data?.message || err?.message || 'Falha ao carregar detalhes da expedição'
      setErroApi(msg)
      setExpedicaoAtual(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const carregarExpedicoes = useCallback(async () => {
    setLoading(true)
    const targetId = paramId ? Number(paramId) : null

    try {
      const res = await axios.get('/v2/expedicoes', { params: { limite: 50 } })
      const data = res.data

      if (data && data.itens && data.itens.length > 0) {
        const lista = data.itens.map((item: any) => ({
          id: item.id,
          titulo: item.descricao || `Expedição #${item.id} — ${item.cidade_nome || 'PR'}`,
          status: new Date() < new Date(item.data_inicio) ? ('futura' as StatusExpedicao) : ('realizada' as StatusExpedicao)
        }))

        setExpedicoesLista(lista)
        setErroApi(null)

        const idParaCarregar = targetId && lista.some((i: any) => i.id === targetId) ? targetId : (targetId || lista[0].id)
        await carregarDetalhes(idParaCarregar)
      } else if (targetId) {
        await carregarDetalhes(targetId)
      } else {
        setExpedicoesLista([])
        setExpedicaoAtual(null)
      }
    } catch (err: any) {
      if (targetId) {
        try {
          await carregarDetalhes(targetId)
          return
        } catch {}
      }
      const msg = err?.response?.data?.message || err?.message || 'Falha de conexão com a API'
      setErroApi(msg)
      setExpedicoesLista([])
      setExpedicaoAtual(null)
    } finally {
      setLoading(false)
    }
  }, [paramId, carregarDetalhes])

  useEffect(() => {
    carregarExpedicoes()
  }, [carregarExpedicoes])

  const handleSelecionarExpedicao = async (id: number) => {
    navigate(`/expedicoes/detalhes/${id}`)
    await carregarDetalhes(id)
  }

  const handleConfirmarExclusao = () => {
    if (!expedicaoAtual) return

    Modal.confirm({
      title: 'Excluir expedição',
      content: `Tem certeza que deseja excluir "${expedicaoAtual.titulo}"? Esta ação não pode ser desfeita.`,
      okText: 'Sim',
      okType: 'danger',
      cancelText: 'Não',
      onOk: async () => {
        try {
          await axios.delete(`/v2/expedicoes/${expedicaoAtual.id}`)
          notification.success({
            message: 'Expedição excluída',
            description: 'A expedição foi removida com sucesso.'
          })
          navigate('/expedicoes')
        } catch (err: any) {
          notification.error({
            message: 'Erro ao excluir expedição',
            description: err?.response?.data?.message || err?.message || 'Falha na exclusão'
          })
        }
      }
    })
  }

  if (loading && !expedicaoAtual) {
    return (
      <Row justify="center" align="middle" style={{ padding: '80px 0' }}>
        <Spin size="large" tip="Carregando dados da expedição..." />
      </Row>
    )
  }

  if (!expedicaoAtual) {
    return (
      <Spin spinning={loading} tip="Carregando...">
        <Row>
          <Col span={12}>
            <Title level={2} style={{ fontWeight: 200, margin: 0 }}>
              Expedição
            </Title>
          </Col>
        </Row>
        <Divider dashed />
        <Alert
          message={erroApi || 'Nenhuma expedição encontrada'}
          description={
            erroApi
              ? 'Não foi possível carregar os dados da expedição a partir do servidor.'
              : 'Nenhuma expedição cadastrada ou o identificador informado não existe.'
          }
          type={erroApi ? 'warning' : 'info'}
          showIcon
          action={
            <Button size="small" icon={<ReloadOutlined />} onClick={carregarExpedicoes}>
              Tentar novamente
            </Button>
          }
        />
        <Row style={{ marginTop: 16 }}>
          <Space>
            <Button onClick={() => navigate('/expedicoes')}>Voltar à listagem</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/expedicoes/novo')}>
              Nova Expedição
            </Button>
          </Space>
        </Row>
      </Spin>
    )
  }

  const dataInicioFormatada = expedicaoAtual.dataInicio
    ? moment(expedicaoAtual.dataInicio).format('DD/MM/YYYY')
    : 'Não informada'
  const dataFimFormatada = expedicaoAtual.dataFim
    ? moment(expedicaoAtual.dataFim).format('DD/MM/YYYY')
    : 'Não definida'

  const ehExpedicaoFutura = expedicaoAtual.status === 'futura'

  return (
    <Spin spinning={loading} tip="Carregando...">
      {/* Cabeçalho no padrão NovaExpedicaoPage: h2 com fontWeight: 200 e Divider dashed */}
      <Row justify="space-between" align="middle">
        <Col xs={24} md={14}>
          <Title level={2} style={{ fontWeight: 200, margin: 0 }}>
            {expedicaoAtual.descricao
              ? `Expedição #${expedicaoAtual.id} — ${expedicaoAtual.descricao}`
              : `Expedição #${expedicaoAtual.id}`}
          </Title>
        </Col>
        <Col xs={24} md={10} style={{ textAlign: 'right' }}>
          <Space>
            {getStatusTag(expedicaoAtual.status)}
            {expedicoesLista.length > 1 && (
              <Select
                value={expedicaoAtual.id}
                onChange={handleSelecionarExpedicao}
                style={{ minWidth: 220, textAlign: 'left' }}
              >
                {expedicoesLista.map(exp => (
                  <Option key={exp.id} value={exp.id}>
                    {exp.titulo}
                  </Option>
                ))}
              </Select>
            )}
          </Space>
        </Col>
      </Row>
      <Divider dashed />

      {/* Barra de Ações Superior */}
      <Row justify="space-between" align="middle" gutter={8} style={{ marginBottom: 16 }}>
        <Col>
          <Button onClick={() => navigate('/expedicoes')}>
            Voltar à listagem
          </Button>
        </Col>
        <Col>
          <Row gutter={8}>
            <Col>
              <Button
                icon={<EditOutlined />}
                onClick={() => navigate(`/expedicoes/editar/${expedicaoAtual.id}`)}
              >
                Editar
              </Button>
            </Col>
            <Col>
              <Button danger icon={<DeleteOutlined />} onClick={handleConfirmarExclusao}>
                Excluir
              </Button>
            </Col>
            <Col>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('/expedicoes/novo')}
              >
                Nova Expedição
              </Button>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Linha de Datas e Destino no padrão de campos de NovaExpedicaoPage */}
      <Row gutter={8} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
          <Col span={24}>
            <Text type="secondary">Data de Início</Text>
          </Col>
          <Col span={24} style={{ marginTop: 4 }}>
            <Text style={{ fontSize: 15, fontWeight: 500 }}>{dataInicioFormatada}</Text>
          </Col>
        </Col>

        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
          <Col span={24}>
            <Text type="secondary">Data de Fim</Text>
          </Col>
          <Col span={24} style={{ marginTop: 4 }}>
            <Text style={{ fontSize: 15, fontWeight: 500 }}>{dataFimFormatada}</Text>
          </Col>
        </Col>

        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
          <Col span={24}>
            <Text type="secondary">Destino</Text>
          </Col>
          <Col span={24} style={{ marginTop: 4 }}>
            <Text style={{ fontSize: 15, fontWeight: 500 }}>{expedicaoAtual.destino}</Text>
          </Col>
        </Col>
      </Row>

      {/* Descrição */}
      <Row gutter={8} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <Col span={24}>
            <Text type="secondary">Descrição</Text>
          </Col>
          <Col span={24} style={{ marginTop: 4 }}>
            <Paragraph style={{ whiteSpace: 'pre-wrap', margin: 0, fontSize: 14 }}>
              {expedicaoAtual.descricao || 'Sem descrição cadastrada.'}
            </Paragraph>
          </Col>
        </Col>
      </Row>

      {/* Participantes */}
      <Row gutter={8} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <Col span={24}>
            <Text type="secondary">
              Participantes ({expedicaoAtual.participantes.length})
            </Text>
          </Col>
          <Col span={24} style={{ marginTop: 6 }}>
            {expedicaoAtual.participantes.length === 0 ? (
              <Text type="secondary">Nenhum participante vinculado.</Text>
            ) : (
              <List
                size="small"
                bordered
                dataSource={expedicaoAtual.participantes}
                renderItem={(p, idx) => (
                  <List.Item key={p.id}>
                    <Space>
                      <Tag color={idx === 0 ? 'green' : 'default'}>
                        {p.funcao || (idx === 0 ? 'Coordenador' : 'Pesquisador')}
                      </Tag>
                      <Text strong>{p.nome}</Text>
                      {p.email && <Text type="secondary">({p.email})</Text>}
                    </Space>
                  </List.Item>
                )}
              />
            )}
          </Col>
        </Col>
      </Row>

      {/* Rota (lista de paradas) */}
      <Row gutter={8} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <Col span={24}>
            <Text type="secondary">
              Rota ({expedicaoAtual.rotas.length} {expedicaoAtual.rotas.length === 1 ? 'parada' : 'paradas'})
            </Text>
          </Col>
          <Col span={24} style={{ marginTop: 6 }}>
            {expedicaoAtual.rotas.length === 0 ? (
              <Text type="secondary">Nenhuma parada cadastrada na rota.</Text>
            ) : (
              <List
                size="small"
                bordered
                dataSource={expedicaoAtual.rotas}
                renderItem={(parada, index) => (
                  <List.Item key={parada.id}>
                    <Space>
                      <Tag color="blue">{`Parada ${index + 1}`}</Tag>
                      <Text>{parada.nome}</Text>
                      {parada.descricao && (
                        <Text type="secondary">— {parada.descricao}</Text>
                      )}
                    </Space>
                  </List.Item>
                )}
              />
            )}
          </Col>
        </Col>
      </Row>

      <Divider dashed />

      {/* Registros e Evidências */}
      <Row gutter={8} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Col span={24} style={{ marginBottom: 8 }}>
            <Title level={3} style={{ fontWeight: 200, margin: 0 }}>
              Registros e Evidências de Campo
            </Title>
          </Col>
          <Col span={24}>
            {ehExpedicaoFutura ? (
              <Alert
                type="info"
                showIcon
                message="Expedição Planejada"
                description="Esta expedição ainda não foi realizada. Os registros de campo (anotações, fotos e áudios) serão integrados pelos pesquisadores durante a execução dos trabalhos."
              />
            ) : expedicaoAtual.evidencias.length === 0 ? (
              <Empty description="Nenhuma evidência registrada para esta expedição." />
            ) : (
              <List
                size="small"
                bordered
                dataSource={expedicaoAtual.evidencias}
                renderItem={item => {
                  const apiBase = (axios.defaults.baseURL || '').replace(/\/api\/?$/, '')
                  return (
                    <List.Item key={item.id}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Space wrap>
                          <Tag color={item.tipo === 'COLETA' ? 'blue' : item.tipo === 'DIARIO' ? 'purple' : 'default'}>
                            {item.tipo === 'COLETA' ? 'Coleta' : item.tipo === 'DIARIO' ? 'Diário' : item.tipo}
                          </Tag>
                          <Tag color="green">{moment(item.dataHora).format('DD/MM/YYYY HH:mm')}</Tag>
                          <Text strong>{item.titulo}</Text>
                        </Space>

                        {item.coleta?.familia && (
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            Família botânica: {item.coleta.familia}
                          </Text>
                        )}

                        {item.conteudo && item.conteudo !== item.titulo && (
                          <Paragraph style={{ margin: 0 }}>{item.conteudo}</Paragraph>
                        )}

                        {item.arquivos && item.arquivos.length > 0 && (
                          <Space direction="vertical" size={4} style={{ marginTop: 4 }}>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              Anexos ({item.arquivos.length}):
                            </Text>
                            <Space wrap>
                              {item.arquivos.map(arq => {
                                const fileHref = arq.url.startsWith('http') ? arq.url : `${apiBase}${arq.url}`
                                return (
                                  <Button
                                    key={arq.id}
                                    size="small"
                                    type="dashed"
                                    icon={<PaperClipOutlined />}
                                    href={fileHref}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    {arq.nome || 'Arquivo de evidência'}
                                  </Button>
                                )
                              })}
                            </Space>
                          </Space>
                        )}
                      </Space>
                    </List.Item>
                  )
                }}
              />
            )}
          </Col>
        </Col>
      </Row>

      <Divider dashed />
    </Spin>
  )
}
