import moment from 'moment'

/** Teto provisório da listagem. A API devolve a página mais recente; o cliente reordena. */
export const LIMITE_EVENTOS = 1000

export const CAMPOS_FICHA = [
  'familia',
  'nome_popular',
  'nome_cientifico',
  'municipio',
  'estado',
  'referencia_local',
  'tipo_vegetacao',
  'solo',
  'relevo',
  'substrato',
  'tronco_com_casca',
  'associacoes',
  'folhas',
  'habito',
  'frutos',
  'flores',
  'luminosidade'
] as const

export type CampoFicha = typeof CAMPOS_FICHA[number]

export type FichaColeta = Record<CampoFicha, string | null>

export const ROTULOS_FICHA: Record<CampoFicha, string> = {
  familia: 'Família',
  nome_popular: 'Nome popular',
  nome_cientifico: 'Nome científico',
  municipio: 'Município',
  estado: 'Estado',
  referencia_local: 'Referência local',
  tipo_vegetacao: 'Tipo de vegetação',
  solo: 'Solo',
  relevo: 'Relevo',
  substrato: 'Substrato',
  tronco_com_casca: 'Tronco com casca',
  associacoes: 'Associações',
  folhas: 'Folhas',
  habito: 'Hábito',
  frutos: 'Frutos',
  flores: 'Flores',
  luminosidade: 'Luminosidade'
}

export interface ArquivoEvento {
  id: number
  nome: string
  url: string
  mimeType: string | null
  tamanho: number | null
}

export interface EventoLinha {
  id: number
  tipo: string
  capturadoEm: string
  observacoes: string | null
  latitude: number | null
  longitude: number | null
  altitude: number | null
  createdBy: number | null
  coleta: FichaColeta | null
  arquivos: ArquivoEvento[]
}

export interface ParticipanteNome {
  id: number | string
  nome: string
}

export interface AtributoResumo {
  rotulo: string
  valor: string
}

export interface PaginaEventos {
  itens: EventoLinha[]
  total: number
}

export interface FiltroEventos {
  tipo?: string
  de?: number
  ate?: number
  texto?: string
  familia?: string
  nomePopular?: string
  nomeCientifico?: string
  anexo?: 'com' | 'sem'
}

export function textoOuTraco(valor: string | null | undefined): string {
  if (valor === null || valor === undefined) return '-'
  const limpo = valor.trim()
  return limpo === '' ? '-' : limpo
}

export function numeroOuTraco(valor: number | null): string {
  return valor === null ? '-' : String(valor)
}

export function formatarDataHora(iso: string): string {
  if (iso.trim() === '') return '-'
  const data = moment(iso, moment.ISO_8601, true)
  return data.isValid() ? data.format('DD/MM/YYYY HH:mm') : '-'
}

export function nomeAutor(createdBy: number | null, participantes: ParticipanteNome[]): string {
  if (createdBy === null) return '-'
  const participante = participantes.find(item => Number(item.id) === createdBy)
  if (!participante) return '-'
  return textoOuTraco(participante.nome)
}

export function resumoDoEvento(evento: EventoLinha, participantes: ParticipanteNome[]): AtributoResumo[] {
  const data = formatarDataHora(evento.capturadoEm)
  if (evento.tipo === 'COLETA') {
    return [
      { rotulo: 'Tipo', valor: 'Coleta' },
      { rotulo: 'Data', valor: data },
      { rotulo: 'Nome científico', valor: textoOuTraco(evento.coleta?.nome_cientifico) },
      { rotulo: 'Nome popular', valor: textoOuTraco(evento.coleta?.nome_popular) }
    ]
  }
  if (evento.tipo === 'DIARIO') {
    return [
      { rotulo: 'Tipo', valor: 'Diário' },
      { rotulo: 'Data', valor: data },
      { rotulo: 'Autor', valor: nomeAutor(evento.createdBy, participantes) },
      { rotulo: 'Observações', valor: textoOuTraco(evento.observacoes) }
    ]
  }
  return [
    { rotulo: 'Tipo', valor: textoOuTraco(evento.tipo) },
    { rotulo: 'Data', valor: data },
    { rotulo: 'Autor', valor: nomeAutor(evento.createdBy, participantes) },
    { rotulo: 'Observações', valor: textoOuTraco(evento.observacoes) }
  ]
}

export function camposDoCorpo(evento: EventoLinha, participantes: ParticipanteNome[]): AtributoResumo[] {
  const observacoes = { rotulo: 'Observações', valor: textoOuTraco(evento.observacoes) }
  const local = [
    { rotulo: 'Latitude', valor: numeroOuTraco(evento.latitude) },
    { rotulo: 'Longitude', valor: numeroOuTraco(evento.longitude) },
    { rotulo: 'Altitude', valor: numeroOuTraco(evento.altitude) },
    { rotulo: 'Autor', valor: nomeAutor(evento.createdBy, participantes) }
  ]
  if (evento.tipo !== 'COLETA') return [observacoes, ...local]

  const ficha = CAMPOS_FICHA.map(campo => ({
    rotulo: ROTULOS_FICHA[campo],
    valor: textoOuTraco(evento.coleta?.[campo])
  }))
  return [
    observacoes,
    ...ficha,
    ...local
  ]
}

function instante(evento: EventoLinha): number {
  const valor = new Date(evento.capturadoEm).getTime()
  return Number.isFinite(valor) ? valor : 0
}

export function ordenarEventos(eventos: EventoLinha[]): EventoLinha[] {
  return [...eventos].sort((a, b) => {
    const diferenca = instante(a) - instante(b)
    if (diferenca !== 0) return diferenca
    return a.id - b.id
  })
}

function inclui(valor: string | null, termo: string | undefined): boolean {
  if (termo === undefined || termo.trim() === '') return true
  if (valor === null) return false
  return valor.toLocaleLowerCase('pt-BR').includes(termo.trim().toLocaleLowerCase('pt-BR'))
}

export function filtrarEventos(eventos: EventoLinha[], filtro: FiltroEventos): EventoLinha[] {
  return eventos.filter(evento => {
    if (filtro.tipo && evento.tipo !== filtro.tipo) return false
    const momento = instante(evento)
    if (filtro.de !== undefined && momento < filtro.de) return false
    if (filtro.ate !== undefined && momento > filtro.ate) return false
    if (!inclui(evento.observacoes, filtro.texto)) return false
    if (!inclui(evento.coleta?.familia ?? null, filtro.familia)) return false
    if (!inclui(evento.coleta?.nome_popular ?? null, filtro.nomePopular)) return false
    if (!inclui(evento.coleta?.nome_cientifico ?? null, filtro.nomeCientifico)) return false
    if (filtro.anexo === 'com' && evento.arquivos.length === 0) return false
    if (filtro.anexo === 'sem' && evento.arquivos.length > 0) return false
    return true
  })
}

function comoRegistro(valor: unknown): Record<string, unknown> | null {
  if (typeof valor !== 'object' || valor === null) return null
  return valor as Record<string, unknown>
}

function textoOpcional(valor: unknown): string | null {
  if (typeof valor !== 'string') return null
  const limpo = valor.trim()
  return limpo === '' ? null : limpo
}

function numeroOpcional(valor: unknown): number | null {
  if (typeof valor === 'number' && Number.isFinite(valor)) return valor
  if (typeof valor === 'string' && valor.trim() !== '') {
    const numero = Number(valor)
    return Number.isFinite(numero) ? numero : null
  }
  return null
}

function inteiroOpcional(valor: unknown): number | null {
  const numero = numeroOpcional(valor)
  if (numero === null || !Number.isInteger(numero)) return null
  return numero
}

function fichaDe(valor: unknown): FichaColeta {
  const registro = comoRegistro(valor) ?? {}
  return {
    familia: textoOpcional(registro.familia),
    nome_popular: textoOpcional(registro.nome_popular),
    nome_cientifico: textoOpcional(registro.nome_cientifico),
    municipio: textoOpcional(registro.municipio),
    estado: textoOpcional(registro.estado),
    referencia_local: textoOpcional(registro.referencia_local),
    tipo_vegetacao: textoOpcional(registro.tipo_vegetacao),
    solo: textoOpcional(registro.solo),
    relevo: textoOpcional(registro.relevo),
    substrato: textoOpcional(registro.substrato),
    tronco_com_casca: textoOpcional(registro.tronco_com_casca),
    associacoes: textoOpcional(registro.associacoes),
    folhas: textoOpcional(registro.folhas),
    habito: textoOpcional(registro.habito),
    frutos: textoOpcional(registro.frutos),
    flores: textoOpcional(registro.flores),
    luminosidade: textoOpcional(registro.luminosidade)
  }
}

function eventoDaResposta(valor: unknown): EventoLinha | null {
  const registro = comoRegistro(valor)
  if (!registro) return null
  const id = inteiroOpcional(registro.id)
  if (id === null) return null
  const tipo = textoOpcional(registro.tipo) ?? 'EVENTO'
  return {
    id,
    tipo,
    capturadoEm: textoOpcional(registro.capturado_em) ?? '',
    observacoes: textoOpcional(registro.observacoes),
    latitude: numeroOpcional(registro.latitude),
    longitude: numeroOpcional(registro.longitude),
    altitude: numeroOpcional(registro.altitude),
    createdBy: inteiroOpcional(registro.created_by),
    coleta: tipo === 'COLETA' ? fichaDe(registro.coleta) : null,
    arquivos: []
  }
}

export function paginaEventosDaResposta(body: unknown): PaginaEventos {
  const registro = comoRegistro(body)
  const lista = registro && Array.isArray(registro.itens) ? registro.itens : []
  const itens = lista.flatMap(item => {
    const evento = eventoDaResposta(item)
    return evento ? [evento] : []
  })
  const total = registro ? numeroOpcional(registro.total) : null
  return {
    itens,
    total: total ?? itens.length
  }
}

export function evidenciasDaResposta(body: unknown): ArquivoEvento[] {
  if (!Array.isArray(body)) return []
  return body.flatMap(item => {
    const registro = comoRegistro(item)
    if (!registro) return []
    const id = inteiroOpcional(registro.id)
    if (id === null) return []
    return [
      {
        id,
        nome: textoOpcional(registro.nome) ?? 'Arquivo',
        url: textoOpcional(registro.url) ?? '',
        mimeType: textoOpcional(registro.mime_type),
        tamanho: numeroOpcional(registro.tamanho)
      }
    ]
  })
}

export function resolverUrlEvidencia(url: string, baseUrl: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  const base = baseUrl.replace(/\/api\/?$/, '')
  return `${base}${url}`
}
