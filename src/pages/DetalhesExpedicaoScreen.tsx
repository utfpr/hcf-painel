import React, {
  useEffect, useState, useCallback
} from 'react'

import {
  Row,
  Col,
  Divider,
  Tag,
  Button,
  Space,
  Alert,
  List,
  Spin,
  Empty,
  Typography
} from 'antd'
import axios from 'axios'
import moment from 'moment'
import {
  Link, useParams, useNavigate
} from 'react-router'

import { useAuth } from '@/contexts/Auth/useAuth'
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CompassOutlined,
  ReloadOutlined,
  PaperClipOutlined
} from '@ant-design/icons'

const {
  Title, Text, Paragraph
} = Typography

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
  locais: string[]
}

interface RotaApi {
  cidade_id?: number
  nome_cidade?: string
  locais_coleta_ids?: unknown
  locais_coleta?: unknown
}

function idDeLocal(item: unknown): number | undefined {
  if (typeof item === 'number' && Number.isFinite(item)) return item
  if (typeof item !== 'object' || item === null || !('id' in item)) return undefined
  const id = Number((item as { id: unknown }).id)
  return Number.isFinite(id) ? id : undefined
}

function nomeDeLocal(item: unknown): string | undefined {
  if (typeof item === 'string') {
    const nome = item.trim()
    return nome === '' ? undefined : nome
  }
  if (typeof item !== 'object' || item === null) return undefined
  const registro = item as { descricao?: unknown; nome?: unknown }
  const bruto = registro.descricao ?? registro.nome
  if (typeof bruto !== 'string') return undefined
  const nome = bruto.trim()
  return nome === '' ? undefined : nome
}

/** Nomes já vindos na rota, ou os ids que ainda precisam de nome. */
export function locaisVisitadosDaParada(rota: RotaApi): { nomes: string[]; ids: number[] } {
  const lista = Array.isArray(rota.locais_coleta) ? rota.locais_coleta : []
  const idsInformados = Array.isArray(rota.locais_coleta_ids)
    ? rota.locais_coleta_ids.map(id => Number(id)).filter(id => Number.isFinite(id))
    : lista.map(idDeLocal).filter((id): id is number => id !== undefined)

  const nomes = lista.flatMap(item => {
    const nome = nomeDeLocal(item)
    if (!nome) return []
    if (idsInformados.length === 0) return [nome]
    const id = idDeLocal(item)
    return id !== undefined && idsInformados.includes(id) ? [nome] : []
  })

  if (nomes.length > 0) return { nomes, ids: [] }
  return { nomes: [], ids: idsInformados }
}

interface LocalColetaApi {
  id?: unknown
  descricao?: unknown
}

async function nomesDosIds(cidadeId: number, ids: number[]): Promise<string[]> {
  try {
    const res = await axios.get<{ resultado?: LocalColetaApi[] }>('/locais-coleta', {
      params: { cidade_id: cidadeId, getAll: 'true' }
    })
    const porId = new Map<number, string>()
    for (const local of res.data?.resultado ?? []) {
      if (typeof local.descricao !== 'string') continue
      const nome = local.descricao.trim()
      const id = Number(local.id)
      if (nome !== '' && Number.isFinite(id)) porId.set(id, nome)
    }
    return ids.flatMap(id => {
      const nome = porId.get(id)
      return nome ? [nome] : []
    })
  } catch {
    return []
  }
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
  const { can } = useAuth()
  const podeEditar = can('update', 'Expedicao')

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

      const destino
        = raw.rotas?.find((r: any) => r.cidade_id === raw.cidade_id)?.nome_cidade
            || raw.rotas?.[0]?.nome_cidade
            || raw.cidade_nome
            || 'Destino não informado'

      const participantes: ParticipanteExpedicao[] = (raw.participantes || []).map((p: any, idx: number) => ({
        id: p.id,
        nome: p.nome,
        email: p.email,
        funcao: idx === 0 ? 'Coordenador' : 'Pesquisador'
      }))

      const rotas: ParadaRota[] = await Promise.all((raw.rotas || []).map(async (r: RotaApi, idx: number) => {
        const visitados = locaisVisitadosDaParada(r)
        const locais = visitados.ids.length === 0 || !r.cidade_id
          ? visitados.nomes
          : await nomesDosIds(r.cidade_id, visitados.ids)
        return {
          id: r.cidade_id || idx + 1,
          ordem: idx + 1,
          nome: r.nome_cidade || `Cidade #${r.cidade_id}`,
          locais
        }
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

  useEffect(() => {
    const id = paramId ? Number(paramId) : NaN
    if (!Number.isInteger(id) || id <= 0) {
      setLoading(false)
      setExpedicaoAtual(null)
      setErroApi(null)
      return
    }
    void carregarDetalhes(id)
  }, [paramId, carregarDetalhes])

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
          action={(
            <Button
              size="small"
              icon={<ReloadOutlined />}
              onClick={() => {
                if (paramId) void carregarDetalhes(Number(paramId))
              }}
            >
              Tentar novamente
            </Button>
          )}
        />
        <Row style={{ marginTop: 16 }}>
          <Space>
            <Button onClick={() => navigate('/expedicoes')}>Voltar à listagem</Button>
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
      <Row gutter={24} style={{ marginBottom: 20 }} align="middle">
        <Col xs={24} sm={16}>
          <h2 style={{ fontWeight: 200, margin: 0 }}>
            {`Expedição #${expedicaoAtual.id}`}
          </h2>
        </Col>
        <Col xs={24} sm={8} style={{ textAlign: 'right' }}>
          {getStatusTag(expedicaoAtual.status)}
        </Col>
      </Row>
      <Divider dashed />

      {podeEditar && (
        <Link to={`/expedicoes/${expedicaoAtual.id}`}>
          <Button type="primary">Editar</Button>
        </Link>
      )}

      <Row gutter={8} style={{ margin: '20px 0' }}>
        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
          <Col span={24}>
            <h4>Data de Início</h4>
          </Col>
          <Col span={24}>
            <span>{dataInicioFormatada}</span>
          </Col>
        </Col>

        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
          <Col span={24}>
            <h4>Data de Fim</h4>
          </Col>
          <Col span={24}>
            <span>{dataFimFormatada}</span>
          </Col>
        </Col>

        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
          <Col span={24}>
            <h4>Destino</h4>
          </Col>
          <Col span={24}>
            <span>{expedicaoAtual.destino}</span>
          </Col>
        </Col>
      </Row>

      <Row gutter={8} style={{ marginBottom: 20 }}>
        <Col span={24}>
          <h4>Descrição</h4>
          <span style={{ whiteSpace: 'pre-wrap' }}>
            {expedicaoAtual.descricao || 'Sem descrição cadastrada.'}
          </span>
        </Col>
      </Row>

      {/* Participantes */}
      <Row gutter={8} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <Col span={24}>
            <h4>
              {`Participantes (${expedicaoAtual.participantes.length})`}
            </h4>
          </Col>
          <Col span={24} style={{ marginTop: 6 }}>
            {expedicaoAtual.participantes.length === 0
              ? (
                <Text type="secondary">Nenhum participante vinculado.</Text>
              )
              : (
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
                        {p.email && (
                          <Text type="secondary">
                            (
                            {p.email}
                            )
                          </Text>
                        )}
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
            <h4>
              {`Rota (${expedicaoAtual.rotas.length} ${expedicaoAtual.rotas.length === 1 ? 'parada' : 'paradas'})`}
            </h4>
          </Col>
          <Col span={24} style={{ marginTop: 6 }}>
            {expedicaoAtual.rotas.length === 0
              ? (
                <Text type="secondary">Nenhuma parada cadastrada na rota.</Text>
              )
              : (
                <List
                  size="small"
                  bordered
                  dataSource={expedicaoAtual.rotas}
                  renderItem={(parada, index) => (
                    <List.Item key={`${parada.id}-${index}`}>
                      <div>
                        <Space>
                          <Tag color="blue">{`Parada ${index + 1}`}</Tag>
                          <Text>{parada.nome}</Text>
                        </Space>
                        {parada.locais.length > 0 && (
                          <div style={{ marginTop: 4, marginLeft: 8 }}>
                            {parada.locais.map(nome => (
                              <div key={nome}>{nome}</div>
                            ))}
                          </div>
                        )}
                      </div>
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
            {ehExpedicaoFutura
              ? (
                <Alert
                  type="info"
                  showIcon
                  message="Expedição Planejada"
                  description="Esta expedição ainda não foi realizada. Os registros de campo (anotações, fotos e áudios) serão integrados pelos pesquisadores durante a execução dos trabalhos."
                />
              )
              : expedicaoAtual.evidencias.length === 0
                ? (
                  <Empty description="Nenhuma evidência registrada para esta expedição." />
                )
                : (
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
                                Família botânica:
                                {' '}
                                {item.coleta.familia}
                              </Text>
                            )}

                            {item.conteudo && item.conteudo !== item.titulo && (
                              <Paragraph style={{ margin: 0 }}>{item.conteudo}</Paragraph>
                            )}

                            {item.arquivos && item.arquivos.length > 0 && (
                              <Space direction="vertical" size={4} style={{ marginTop: 4 }}>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  Anexos (
                                  {item.arquivos.length}
                                  ):
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
