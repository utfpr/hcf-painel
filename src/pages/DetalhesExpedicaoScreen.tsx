import {
  useCallback, useEffect, useRef, useState
} from 'react'

import {
  Alert,
  Button,
  Col,
  Divider,
  List,
  Row,
  Space,
  Spin,
  Tag,
  Typography
} from 'antd'
import axios from 'axios'
import moment from 'moment'
import {
  Link, useNavigate, useParams
} from 'react-router'

import { useAuth } from '@/contexts/Auth/useAuth'
import LinhaDoTempoExpedicao from '@/features/expedicoes/components/LinhaDoTempoExpedicao'
import {
  LIMITE_EVENTOS,
  evidenciasDaResposta,
  ordenarEventos,
  paginaEventosDaResposta,
  resolverUrlEvidencia,
  type EventoLinha
} from '@/features/expedicoes/linhaDoTempo'
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CompassOutlined,
  ReloadOutlined
} from '@ant-design/icons'

const {
  Title, Text
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
}

interface ParticipanteApi {
  id: number | string
  nome: string
  email?: string
}

interface ExpedicaoApi {
  id: number
  descricao?: string | null
  data_inicio?: string
  data_fim?: string
  cidade_id?: number
  cidade_nome?: string
  rotas?: RotaApi[]
  participantes?: ParticipanteApi[]
}

function mensagemErro(err: unknown, fallback: string): string {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const data = (err as {
      response?: { data?: { message?: unknown; error?: { message?: unknown } } }
    }).response?.data
    const aninhada = data?.error?.message
    if (typeof aninhada === 'string' && aninhada.trim() !== '') return aninhada
    if (typeof data?.message === 'string' && data.message.trim() !== '') return data.message
  }
  if (err instanceof Error && err.message.trim() !== '') return err.message
  return fallback
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
  const [eventos, setEventos] = useState<EventoLinha[]>([])
  const [totalEventos, setTotalEventos] = useState(0)
  const [carregandoEventos, setCarregandoEventos] = useState(false)
  const [erroEventos, setErroEventos] = useState<string | null>(null)
  const pedidoRef = useRef(0)

  const carregarEventos = useCallback(async (id: number, pedido: number) => {
    setCarregandoEventos(true)
    setErroEventos(null)
    try {
      const resEventos = await axios.get<unknown>(`/v1/expedicoes/${id}/eventos`, {
        params: {
          limite: LIMITE_EVENTOS,
          pagina: 1
        }
      })
      const pagina = paginaEventosDaResposta(resEventos.data)
      const baseUrl = axios.defaults.baseURL ?? ''
      const completos = await Promise.all(pagina.itens.map(async evento => {
        try {
          const resEvidencias = await axios.get<unknown>(`/v1/eventos/${evento.id}/evidencias`)
          return {
            ...evento,
            arquivos: evidenciasDaResposta(resEvidencias.data).map(arquivo => ({
              ...arquivo,
              url: resolverUrlEvidencia(arquivo.url, baseUrl)
            }))
          }
        } catch {
          return evento
        }
      }))
      if (pedidoRef.current !== pedido) return
      setTotalEventos(pagina.total)
      setEventos(ordenarEventos(completos))
    } catch (err: unknown) {
      if (pedidoRef.current !== pedido) return
      setEventos([])
      setTotalEventos(0)
      setErroEventos(mensagemErro(err, 'Falha ao carregar os eventos da expedição'))
    } finally {
      if (pedidoRef.current === pedido) setCarregandoEventos(false)
    }
  }, [])

  const carregarDetalhes = useCallback(async (id: number) => {
    const pedido = ++pedidoRef.current
    setCarregandoEventos(true)
    setEventos([])
    setTotalEventos(0)
    setErroEventos(null)
    try {
      setLoading(true)
      const res = await axios.get(`/v1/expedicoes/${id}`)
      const raw = res.data

      const hoje = new Date()
      const dataInicio = new Date(raw.data_inicio ?? '')
      const dataFim = new Date(raw.data_fim ?? '')

      let status: StatusExpedicao = 'realizada'
      if (hoje < dataInicio) {
        status = 'futura'
      } else if (hoje <= dataFim) {
        status = 'em_andamento'
      }

      const destino
        = raw.rotas?.find((rota: RotaApi) => rota.cidade_id === raw.cidade_id)?.nome_cidade
            || raw.rotas?.[0]?.nome_cidade
            || raw.cidade_nome
            || 'Destino não informado'

      const participantes: ParticipanteExpedicao[] = (raw.participantes ?? []).map((participante: ParticipanteApi, idx: number) => ({
        id: participante.id,
        nome: participante.nome,
        email: participante.email,
        funcao: idx === 0 ? 'Coordenador' : 'Pesquisador'
      }))

      const rotas: ParadaRota[] = await Promise.all((raw.rotas ?? []).map(async (rota: RotaApi, idx: number) => {
        const visitados = locaisVisitadosDaParada(rota)
        const locais = visitados.ids.length === 0 || !rota.cidade_id
          ? visitados.nomes
          : await nomesDosIds(rota.cidade_id, visitados.ids)
        return {
          id: rota.cidade_id || idx + 1,
          ordem: idx + 1,
          nome: rota.nome_cidade || `Cidade #${rota.cidade_id}`,
          locais
        }
      }))

      if (pedidoRef.current !== pedido) return

      setExpedicaoAtual({
        id: raw.id,
        titulo: raw.descricao || `Expedição #${raw.id}`,
        descricao: raw.descricao || 'Sem descrição cadastrada.',
        status,
        dataInicio: raw.data_inicio ?? '',
        dataFim: raw.data_fim ?? '',
        destino,
        participantes,
        rotas
      })
      setErroApi(null)
      setLoading(false)

      if (status === 'futura') {
        setCarregandoEventos(false)
        return
      }

      await carregarEventos(id, pedido)
    } catch (err: unknown) {
      if (pedidoRef.current !== pedido) return
      setErroApi(mensagemErro(err, 'Falha ao carregar detalhes da expedição'))
      setExpedicaoAtual(null)
      setCarregandoEventos(false)
    } finally {
      if (pedidoRef.current === pedido) setLoading(false)
    }
  }, [carregarEventos])

  useEffect(() => {
    const id = paramId ? Number(paramId) : NaN
    if (!Number.isInteger(id) || id <= 0) {
      setLoading(false)
      setCarregandoEventos(false)
      setEventos([])
      setTotalEventos(0)
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
              : (
                <LinhaDoTempoExpedicao
                  eventos={eventos}
                  total={totalEventos}
                  carregando={carregandoEventos}
                  erro={erroEventos}
                  participantes={expedicaoAtual.participantes}
                  onRecarregar={() => {
                    const pedido = ++pedidoRef.current
                    void carregarEventos(expedicaoAtual.id, pedido)
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
