/**
 * Contrato da EDIÇÃO de expedições.
 *
 * Isolado do `expedicaoContract.ts` (criação) para não conflitar com o PR #404.
 * Baseado no backend real da branch `532-cadastro-expedicoes` do hcf-api:
 *   GET    /v2/expedicoes/:id
 *   PUT    /v2/expedicoes/:id                       { descricao, data_inicio, data_fim, cidade_id }
 *   POST   /v2/expedicoes/:id/participantes         { usuarioId }
 *   DELETE /v2/expedicoes/:id/participantes/:usuarioId
 *
 * Pendente de confirmação com o back: a API guarda apenas a
 * DATA (YYYY-MM-DD), sem horário, e exige `data_fim`.
 */

import dayjs, { type Dayjs } from 'dayjs'

export const EXPEDICOES_V2_ENDPOINT = '/v2/expedicoes'
export const FORMATO_DATA_API = 'YYYY-MM-DD'

export interface ParticipanteDetalhado {
  id: number
  nome: string
  email: string
}

export interface ExpedicaoDetalhada {
  id: number
  descricao: string | null
  data_inicio: string
  data_fim: string
  cidade_id: number
  participantes: ParticipanteDetalhado[]
}

export interface UpdateExpedicaoPayload {
  descricao: string | null
  data_inicio: string
  data_fim: string
  cidade_id: number
}

/** Valores que a tela de edição produz. */
export interface EditarExpedicaoFormValues {
  dataInicio: Dayjs
  dataFim: Dayjs
  destino: number
  descricao: string
  participantes: number[]
}

export function toUpdateExpedicaoPayload(
  values: EditarExpedicaoFormValues
): UpdateExpedicaoPayload {
  return {
    descricao: values.descricao.trim() || null,
    data_inicio: values.dataInicio.format(FORMATO_DATA_API),
    data_fim: values.dataFim.format(FORMATO_DATA_API),
    cidade_id: values.destino
  }
}

/** Converte a resposta da API nos valores iniciais do formulário. */
export function toFormValues(expedicao: ExpedicaoDetalhada): EditarExpedicaoFormValues {
  return {
    dataInicio: dayjs(expedicao.data_inicio, FORMATO_DATA_API),
    dataFim: dayjs(expedicao.data_fim, FORMATO_DATA_API),
    destino: expedicao.cidade_id,
    descricao: expedicao.descricao ?? '',
    participantes: expedicao.participantes.map(p => p.id)
  }
}

/**
 * A API não tem "substituir participantes": só adicionar e remover um a um.
 * Calcula o que precisa ser enviado a partir da lista original e da final.
 */
export function diffParticipantes(originais: number[], finais: number[]) {
  const antes = new Set(originais)
  const depois = new Set(finais)
  return {
    adicionar: finais.filter(id => !antes.has(id)),
    remover: originais.filter(id => !depois.has(id))
  }
}
