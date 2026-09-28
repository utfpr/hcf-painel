import type { Moment } from 'moment'

export const EXPEDICOES_ENDPOINT = '/v2/expedicoes'


export interface CreateExpedicaoPayload {
  descricao: string | null
  data_inicio: string
  data_fim?: string
  cidade_id: number
  participantes: number[]
  rotas: number[]
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
  dataFim?: Moment | null
  destino: number
  descricao: string
  participantes: number[]
  rotas?: number[]
}


export function toCreateExpedicaoPayload(
  values: NovaExpedicaoFormValues
): CreateExpedicaoPayload {
  const descricao = values.descricao.trim()

  return {
    descricao: descricao === '' ? null : descricao,
    data_inicio: values.dataInicio.format(),
    data_fim: values.dataFim ? values.dataFim.format() : undefined,
    cidade_id: values.destino,
    participantes: values.participantes,
    rotas: values.rotas ?? []
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
