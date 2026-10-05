/**
 * Contrato da EDIÇÃO de expedições.
 *
 * Isolado do `expedicaoContract.ts` (criação) para não conflitar com o PR #404.
 * Baseado no backend real da branch `532-cadastro-expedicoes` do hcf-api:
 *   GET    /v2/expedicoes/:id
 *   PUT    /v2/expedicoes/:id                       { descricao, data_inicio, data_fim, cidade_id }
 *   PUT    /v2/expedicoes/:id/rotas                 { rotas: number[] }  — só se a ordem mudar
 *   POST   /v2/expedicoes/:id/participantes         { usuarioId }
 *   DELETE /v2/expedicoes/:id/participantes/:usuarioId
 *
 * Pendente de confirmação com o back: a API guarda apenas a
 * DATA (YYYY-MM-DD), sem horário, e exige `data_fim`.
 */

import type { Moment } from 'moment'
import moment from 'moment'

import type { OpcaoSelecionada } from '../types'

export const EXPEDICOES_V2_ENDPOINT = '/v2/expedicoes'
export const FORMATO_DATA_API = 'YYYY-MM-DD'

export interface ParticipanteDetalhado {
  id: number
  nome: string
  email: string
}

export interface ParadaDetalhada {
  cidade_id: number
  nome_cidade?: string
}

export interface ExpedicaoDetalhada {
  id: number
  descricao: string | null
  data_inicio: string
  data_fim: string
  cidade_id: number
  participantes: ParticipanteDetalhado[]
  rotas?: ParadaDetalhada[]
}

export interface UpdateExpedicaoPayload {
  descricao: string | null
  data_inicio: string
  data_fim: string
  cidade_id: number
}

/** Valores que a tela de edição produz. O select guarda o label; o id sai no payload. */
export interface EditarExpedicaoFormValues {
  dataInicio: Moment
  dataFim: Moment
  destino: OpcaoSelecionada | number | string
  descricao: string
  participantes: Array<OpcaoSelecionada | number | string>
  rotas?: Array<OpcaoSelecionada | number | string>
}

export function idFromField(value: unknown): number {
  if (typeof value === 'object' && value !== null && 'value' in value) {
    return Number((value as { value: unknown }).value)
  }
  return Number(value)
}

export function toUpdateExpedicaoPayload(
  values: EditarExpedicaoFormValues
): UpdateExpedicaoPayload {
  return {
    descricao: values.descricao.trim() || null,
    data_inicio: values.dataInicio.format(FORMATO_DATA_API),
    data_fim: values.dataFim.format(FORMATO_DATA_API),
    cidade_id: idFromField(values.destino)
  }
}

export interface UpdateRotasPayload {
  rotas: number[]
}

/** A posição no array é a coluna `ordem`. */
export function toUpdateRotasPayload(values: EditarExpedicaoFormValues): UpdateRotasPayload {
  return {
    rotas: (values.rotas ?? []).map(idFromField)
  }
}

/** Mesma sequência de cidade_id: não há o que gravar. */
export function rotasIguais(
  originais: ParadaDetalhada[] | undefined,
  finais: number[]
): boolean {
  const antes = (originais ?? []).map(parada => Number(parada.cidade_id))
  return antes.length === finais.length && antes.every((id, index) => id === finais[index])
}

/** Converte a resposta da API nos valores iniciais do formulário. */
export function toFormValues(expedicao: ExpedicaoDetalhada): EditarExpedicaoFormValues {
  return {
    dataInicio: moment(expedicao.data_inicio, FORMATO_DATA_API),
    dataFim: moment(expedicao.data_fim, FORMATO_DATA_API),
    destino: expedicao.cidade_id,
    descricao: expedicao.descricao ?? '',
    participantes: expedicao.participantes.map(p => ({
      value: p.id,
      label: p.nome
    })),
    rotas: (expedicao.rotas ?? []).map(parada => ({
      value: parada.cidade_id,
      label: parada.nome_cidade ?? String(parada.cidade_id)
    }))
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
