import {
  useMemo, useState, type CSSProperties
} from 'react'

import {
  Alert,
  Button,
  Collapse,
  DatePicker,
  Dropdown,
  Empty,
  Image,
  Input,
  Select,
  Space,
  Spin,
  Row,
  Col
} from 'antd'
import ptBR from 'antd/es/date-picker/locale/pt_BR'
import moment from 'moment'

import {
  DownloadOutlined,
  FullscreenOutlined,
  MinusCircleOutlined,
  PaperClipOutlined,
  PlusCircleOutlined,
  ReloadOutlined,
  RightOutlined
} from '@ant-design/icons'

import type {
  EventoLinha, FiltroEventos, ParticipanteNome
} from '../linhaDoTempo'
import {
  camposDoCorpo,
  filtrarEventos,
  resumoDoEvento
} from '../linhaDoTempo'

const { Panel } = Collapse
const { RangePicker } = DatePicker

const CHAVES_FILTRO = [
  'tipo',
  'periodo',
  'texto',
  'familia',
  'nomePopular',
  'nomeCientifico',
  'anexo'
] as const

type ChaveFiltro = typeof CHAVES_FILTRO[number]

const ROTULO_FILTRO: Record<ChaveFiltro, string> = {
  tipo: 'Tipo',
  periodo: 'Período',
  texto: 'Observações',
  familia: 'Família',
  nomePopular: 'Nome popular',
  nomeCientifico: 'Nome científico',
  anexo: 'Anexo'
}

interface ValoresFiltro {
  tipo?: 'DIARIO' | 'COLETA'
  periodo: [moment.Moment | null, moment.Moment | null] | null
  texto: string
  familia: string
  nomePopular: string
  nomeCientifico: string
  anexo?: 'com' | 'sem'
}

const VALORES_VAZIOS: ValoresFiltro = {
  periodo: null,
  texto: '',
  familia: '',
  nomePopular: '',
  nomeCientifico: ''
}

interface LinhaDoTempoExpedicaoProps {
  eventos: EventoLinha[]
  total: number
  carregando: boolean
  erro: string | null
  participantes: ParticipanteNome[]
  onRecarregar: () => void
}

function corDoTipo(tipo: string): { fundo: string; borda: string } {
  if (tipo === 'DIARIO') return { fundo: '#fff4cc', borda: '#d4a017' }
  if (tipo === 'COLETA') return { fundo: '#e8f6ec', borda: '#5eae78' }
  return { fundo: '#f5f5f5', borda: '#bfbfbf' }
}

const estiloCarregando: CSSProperties = {
  minHeight: 160,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 12
}

const estiloFiltros: CSSProperties = { marginBottom: 16 }

const estiloFiltro: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  marginTop: 8
}

const estiloFiltroRotulo: CSSProperties = {
  width: 140,
  flex: '0 0 140px'
}

const estiloContagem: CSSProperties = {
  margin: '0 0 12px',
  color: 'rgba(0, 0, 0, 0.45)'
}

const estiloResumo: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '12px 20px',
  width: '100%',
  paddingLeft: 22
}

const estiloSeta: CSSProperties = {
  position: 'absolute',
  top: '50%',
  left: 16,
  transform: 'translateY(-50%)'
}

const estiloAtributo: CSSProperties = {
  minWidth: 120,
  maxWidth: 280,
  flex: '1 1 140px'
}

const estiloRotulo: CSSProperties = {
  display: 'block',
  fontSize: 12,
  lineHeight: '16px',
  color: 'rgba(0, 0, 0, 0.45)'
}

const estiloValor: CSSProperties = {
  display: 'block',
  minHeight: 22,
  lineHeight: '22px'
}

const estiloValorResumo: CSSProperties = {
  ...estiloValor,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
}

const estiloValorCorpo: CSSProperties = {
  ...estiloValor,
  whiteSpace: 'pre-wrap',
  overflowWrap: 'anywhere'
}

const estiloAnexos: CSSProperties = { marginTop: 16 }

const estiloAudio: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: 8,
  marginTop: 8,
  minHeight: 40
}

const estiloPlayer: CSSProperties = {
  display: 'block',
  width: 280,
  height: 40
}

const estiloMiniaturas: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 12,
  marginTop: 8
}

const estiloMiniatura: CSSProperties = {
  position: 'relative',
  width: 240,
  height: 180,
  flex: '0 0 240px',
  background: '#fff',
  border: '1px solid rgba(0, 0, 0, 0.08)',
  borderRadius: 6,
  overflow: 'hidden'
}

const estiloAbrirImagem: CSSProperties = {
  position: 'absolute',
  right: 8,
  bottom: 8,
  zIndex: 2,
  background: 'rgba(255, 255, 255, 0.92)'
}

function textoContagem(visiveis: number, total: number): string {
  const palavra = (quantidade: number) => quantidade === 1 ? 'evento' : 'eventos'
  if (visiveis === total) return `${total} ${palavra(total)}`
  return `${visiveis} de ${total} ${palavra(total)}`
}

function filtroAtivo(chaves: ChaveFiltro[], valores: ValoresFiltro): FiltroEventos {
  const filtro: FiltroEventos = {}
  if (chaves.includes('tipo') && valores.tipo) filtro.tipo = valores.tipo
  if (chaves.includes('periodo') && valores.periodo) {
    const [inicio, fim] = valores.periodo
    if (inicio) filtro.de = inicio.clone().startOf('day').valueOf()
    if (fim) filtro.ate = fim.clone().endOf('day').valueOf()
  }
  if (chaves.includes('texto')) filtro.texto = valores.texto
  if (chaves.includes('familia')) filtro.familia = valores.familia
  if (chaves.includes('nomePopular')) filtro.nomePopular = valores.nomePopular
  if (chaves.includes('nomeCientifico')) filtro.nomeCientifico = valores.nomeCientifico
  if (chaves.includes('anexo') && valores.anexo) filtro.anexo = valores.anexo
  return filtro
}

function semChave(valores: ValoresFiltro, chave: ChaveFiltro): ValoresFiltro {
  if (chave === 'tipo') return { ...valores, tipo: undefined }
  if (chave === 'anexo') return { ...valores, anexo: undefined }
  if (chave === 'periodo') return { ...valores, periodo: null }
  if (chave === 'texto') return { ...valores, texto: '' }
  if (chave === 'familia') return { ...valores, familia: '' }
  if (chave === 'nomePopular') return { ...valores, nomePopular: '' }
  return { ...valores, nomeCientifico: '' }
}

interface CampoFiltroProps {
  chave: ChaveFiltro
  valores: ValoresFiltro
  onChange: (valores: ValoresFiltro) => void
}

function CampoFiltro({
  chave, valores, onChange
}: CampoFiltroProps) {
  if (chave === 'tipo') {
    return (
      <Select
        allowClear
        style={{ width: 200 }}
        placeholder="Tipo"
        value={valores.tipo}
        onChange={valor => {
          onChange({
            ...valores,
            tipo: valor === 'DIARIO' || valor === 'COLETA' ? valor : undefined
          })
        }}
        options={[
          { value: 'COLETA', label: 'Coleta' },
          { value: 'DIARIO', label: 'Diário' }
        ]}
      />
    )
  }
  if (chave === 'periodo') {
    return (
      <RangePicker
        locale={ptBR}
        format="DD/MM/YYYY"
        value={valores.periodo ?? undefined}
        onChange={periodo => {
          onChange({
            ...valores,
            periodo: periodo ? [periodo[0], periodo[1]] : null
          })
        }}
      />
    )
  }
  if (chave === 'anexo') {
    return (
      <Select
        allowClear
        style={{ width: 200 }}
        placeholder="Anexo"
        value={valores.anexo}
        onChange={valor => {
          onChange({
            ...valores,
            anexo: valor === 'com' || valor === 'sem' ? valor : undefined
          })
        }}
        options={[
          { value: 'com', label: 'Com anexo' },
          { value: 'sem', label: 'Sem anexo' }
        ]}
      />
    )
  }
  const campo = chave === 'texto'
    ? 'texto'
    : chave === 'familia'
      ? 'familia'
      : chave === 'nomePopular'
        ? 'nomePopular'
        : 'nomeCientifico'
  return (
    <Input
      allowClear
      style={{ width: 240 }}
      placeholder={ROTULO_FILTRO[chave]}
      value={valores[campo]}
      onChange={evento => {
        onChange({ ...valores, [campo]: evento.target.value })
      }}
    />
  )
}

function MiniaturaImagem({ src, nome }: { src: string; nome: string }) {
  const [aberta, setAberta] = useState(false)

  return (
    <div style={estiloMiniatura}>
      <Image
        src={src}
        alt={nome}
        width={240}
        height={180}
        wrapperStyle={{
          width: 240,
          height: 180
        }}
        style={{
          objectFit: 'cover',
          width: '100%',
          height: '100%'
        }}
        preview={{
          visible: aberta,
          onVisibleChange: visivel => setAberta(visivel),
          mask: false
        }}
      />
      <Button
        style={estiloAbrirImagem}
        size="small"
        aria-label="Ver imagem em tamanho real"
        title="Ver imagem em tamanho real"
        icon={<FullscreenOutlined />}
        onClick={() => setAberta(true)}
      />
    </div>
  )
}

function ehImagem(mimeType: string | null): boolean {
  return mimeType?.startsWith('image/') === true
}

function ehAudio(mimeType: string | null): boolean {
  return mimeType?.startsWith('audio/') === true
}

function AnexosEvento({ arquivos }: { arquivos: EventoLinha['arquivos'] }) {
  const imagens = arquivos.filter(arquivo => ehImagem(arquivo.mimeType))
  const audios = arquivos.filter(arquivo => ehAudio(arquivo.mimeType))
  const outros = arquivos.filter(arquivo => !ehImagem(arquivo.mimeType) && !ehAudio(arquivo.mimeType))

  return (
    <div style={estiloAnexos}>
      <span style={estiloRotulo}>Anexos</span>
      {arquivos.length === 0
        ? <span style={estiloValorCorpo}>-</span>
        : (
          <>
            {imagens.length > 0 && (
              <div style={estiloMiniaturas}>
                {imagens.map(arquivo => (
                  <MiniaturaImagem key={arquivo.id} src={arquivo.url} nome={arquivo.nome} />
                ))}
              </div>
            )}
            {audios.map(arquivo => (
              <div key={arquivo.id} style={estiloAudio}>
                <audio
                  controls
                  preload="none"
                  src={arquivo.url}
                  style={estiloPlayer}
                >
                  {arquivo.nome}
                </audio>
                <Button
                  size="small"
                  icon={<DownloadOutlined />}
                  href={arquivo.url}
                  download={arquivo.nome}
                  aria-label={`Baixar ${arquivo.nome}`}
                >
                  {arquivo.nome}
                </Button>
              </div>
            ))}
            {outros.length > 0 && (
              <Space wrap size={8}>
                {outros.map(arquivo => (
                  <Button
                    key={arquivo.id}
                    size="small"
                    type="link"
                    aria-label={arquivo.nome}
                    icon={<PaperClipOutlined />}
                    href={arquivo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {arquivo.nome}
                  </Button>
                ))}
              </Space>
            )}
          </>
        )}
    </div>
  )
}

function CorpoEvento({ evento, participantes }: { evento: EventoLinha; participantes: ParticipanteNome[] }) {
  const campos = camposDoCorpo(evento, participantes)
  return (
    <>
      <Row gutter={[12, 12]}>
        {campos.map(campo => (
          <Col key={campo.rotulo} xs={24} sm={12} md={8}>
            <span style={estiloRotulo}>{campo.rotulo}</span>
            <span style={estiloValorCorpo}>{campo.valor}</span>
          </Col>
        ))}
      </Row>
      <AnexosEvento arquivos={evento.arquivos} />
    </>
  )
}

function FiltrosLinha({
  chaves,
  valores,
  onAdicionar,
  onRemover,
  onChange,
  onLimpar
}: {
  chaves: ChaveFiltro[]
  valores: ValoresFiltro
  onAdicionar: (chave: ChaveFiltro) => void
  onRemover: (chave: ChaveFiltro) => void
  onChange: (valores: ValoresFiltro) => void
  onLimpar: () => void
}) {
  const disponiveis = CHAVES_FILTRO.filter(chave => !chaves.includes(chave))

  return (
    <div style={estiloFiltros}>
      <Space wrap>
        <Dropdown
          trigger={['click']}
          disabled={disponiveis.length === 0}
          menu={{
            items: disponiveis.map(chave => ({
              key: chave,
              label: ROTULO_FILTRO[chave],
              onClick: () => onAdicionar(chave)
            }))
          }}
        >
          <Button icon={<PlusCircleOutlined />}>Adicionar filtro</Button>
        </Dropdown>
        {chaves.length > 0 && (
          <Button type="link" onClick={onLimpar}>Limpar</Button>
        )}
      </Space>
      {chaves.map(chave => (
        <div key={chave} style={estiloFiltro}>
          <span style={estiloFiltroRotulo}>{ROTULO_FILTRO[chave]}</span>
          <CampoFiltro chave={chave} valores={valores} onChange={onChange} />
          <Button
            type="text"
            danger
            aria-label={`Remover filtro ${ROTULO_FILTRO[chave]}`}
            icon={<MinusCircleOutlined />}
            onClick={() => onRemover(chave)}
          />
        </div>
      ))}
    </div>
  )
}

export default function LinhaDoTempoExpedicao({
  eventos,
  total,
  carregando,
  erro,
  participantes,
  onRecarregar
}: LinhaDoTempoExpedicaoProps) {
  const [chaves, setChaves] = useState<ChaveFiltro[]>([])
  const [valores, setValores] = useState<ValoresFiltro>(VALORES_VAZIOS)
  const visiveis = useMemo(
    () => filtrarEventos(eventos, filtroAtivo(chaves, valores)),
    [
      eventos,
      chaves,
      valores
    ]
  )

  if (carregando) {
    return (
      <div style={estiloCarregando}>
        <Spin size="large" />
        <span>Carregando eventos</span>
      </div>
    )
  }

  if (erro) {
    return (
      <Alert
        type="warning"
        showIcon
        message="Não foi possível carregar os eventos"
        description={erro}
        action={(
          <Button size="small" icon={<ReloadOutlined />} onClick={onRecarregar}>
            Tentar novamente
          </Button>
        )}
      />
    )
  }

  if (eventos.length === 0) {
    return <Empty description="Nenhum evento cadastrado para esta expedição." />
  }

  return (
    <>
      <FiltrosLinha
        chaves={chaves}
        valores={valores}
        onAdicionar={chave => {
          setChaves(atuais => atuais.includes(chave) ? atuais : [...atuais, chave])
        }}
        onRemover={chave => {
          setChaves(atuais => atuais.filter(item => item !== chave))
          setValores(atuais => semChave(atuais, chave))
        }}
        onChange={setValores}
        onLimpar={() => {
          setChaves([])
          setValores({ ...VALORES_VAZIOS })
        }}
      />
      {total > eventos.length && (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 12 }}
          message={`A lista carregou ${eventos.length} de ${total} eventos.`}
        />
      )}
      <p style={estiloContagem}>{textoContagem(visiveis.length, eventos.length)}</p>
      {visiveis.length === 0
        ? <Empty description="Nenhum evento corresponde aos filtros." />
        : visiveis.map(evento => {
          const cor = corDoTipo(evento.tipo)
          return (
            <div
              key={evento.id}
              data-tipo={evento.tipo}
              style={{
                marginBottom: 12,
                borderRadius: 8,
                overflow: 'hidden',
                background: cor.fundo,
                border: `1px solid ${cor.borda}`
              }}
            >
              <Collapse
                ghost
                style={{ background: cor.fundo }}
                expandIcon={({ isActive }) => (
                  <RightOutlined rotate={isActive ? 90 : 0} style={estiloSeta} />
                )}
              >
                <Panel
                  key={String(evento.id)}
                  header={(
                    <div style={estiloResumo}>
                      {resumoDoEvento(evento, participantes).map(atributo => (
                        <div key={atributo.rotulo} style={estiloAtributo}>
                          <span style={estiloRotulo}>{atributo.rotulo}</span>
                          <span style={estiloValorResumo} title={atributo.valor}>{atributo.valor}</span>
                        </div>
                      ))}
                    </div>
                  )}
                >
                  <CorpoEvento evento={evento} participantes={participantes} />
                </Panel>
              </Collapse>
            </div>
          )
        })}
    </>
  )
}
