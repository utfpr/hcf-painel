import type { Moment } from 'moment'

import type {
  OpcaoSelecionada,
  ParadaRotaForm,
  RotaExpedicaoPayload
} from '../types'

export const EXPEDICOES_ENDPOINT = '/v2/expedicoes'


export interface CreateExpedicaoPayload {
  descricao: string | null
  data_inicio: string
  data_fim: string
  cidade_id: number
  participantes: number[]
  rotas: RotaExpedicaoPayload[]
}

export interface ExpedicaoCriada {
  id: number
  descricao: string | null
  data_inicio: string
  data_fim: string
  cidade_id: number
  created_at: string
  updated_at: string
  created_by: number | null
  updated_by: number | null
}

export interface NovaExpedicaoFormValues {
  dataInicio: Moment
  dataFim: Moment
  destino: OpcaoSelecionada | number | string
  descricao: string
  participantes: Array<OpcaoSelecionada | number | string>
  rotas?: Array<ParadaRotaForm | number | string>
}

function toId(value: unknown): number {
  if (typeof value === 'object' && value !== null && 'value' in value) {
    return Number((value as { value: unknown }).value)
  }
  return Number(value)
}

function toRota(value: ParadaRotaForm | number | string): RotaExpedicaoPayload {
  const locais = typeof value === 'object' && value !== null
    ? value.locaisColetaIds ?? []
    : []

  return {
    cidade_id: toId(value),
    locais_coleta_ids: locais.map(id => Number(id))
  }
}

export function toCreateExpedicaoPayload(
  values: NovaExpedicaoFormValues
): CreateExpedicaoPayload {
  const descricao = values.descricao.trim()

  return {
    descricao: descricao === '' ? null : descricao,
    data_inicio: values.dataInicio.format('YYYY-MM-DD'),
    data_fim: values.dataFim.format('YYYY-MM-DD'),
    cidade_id: toId(values.destino),
    participantes: values.participantes.map(toId),
    rotas: (values.rotas ?? []).map(toRota)
  }
}

export function extractApiErrorMessage(error: unknown): string | undefined {
  const message = (error as {
    response?: { data?: { error?: { message?: unknown } } }
  })?.response?.data?.error?.message

  return typeof message === 'string' && message.trim() !== ''
    ? message
    : undefined
}
