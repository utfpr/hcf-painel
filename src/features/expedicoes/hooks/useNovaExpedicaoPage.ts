import { useCallback } from 'react'

import { useContainer } from '@/contexts/Container/useContainer'
import { useMutation } from '@/hooks/query/useMutation'

import {
  CONTRATO_ALINHADO,
  EXPEDICOES_ENDPOINT,
  toCreateExpedicaoPayload,
  type CreateExpedicaoPayload,
  type NovaExpedicaoFormValues
} from '../api/expedicaoContract'
import type {
  CidadeListItem,
  SelectOption,
  UsuariosListResponse
} from '../types'

const BUSCA_LIMITE = 20

/**
 * Lançado quando o submit é acionado antes do contrato da API estar alinhado.
 * A tela trata este caso mostrando um aviso, sem perder os dados preenchidos.
 */
export class ContratoNaoAlinhadoError extends Error {
  constructor() {
    super('Contrato da API de expedições ainda não alinhado com o back-end.')
    this.name = 'ContratoNaoAlinhadoError'
  }
}

export function useNovaExpedicaoPage() {
  const { httpClient } = useContainer()

  const { trigger: postExpedicao } = useMutation(
    (payload: CreateExpedicaoPayload) => httpClient.post<CreateExpedicaoPayload>(
      EXPEDICOES_ENDPOINT,
      payload
    ),
    [EXPEDICOES_ENDPOINT, 'create'],
    { revalidate: [[EXPEDICOES_ENDPOINT]] }
  )

  /** Busca cidades por nome. Endpoint já existente: GET /cidades. */
  const buscarCidades = useCallback(async (nome: string): Promise<SelectOption[]> => {
    const params: Record<string, string | number> = {}
    if (nome.trim()) params.nome = nome.trim()

    const response = await httpClient.get<CidadeListItem[]>('/cidades', params)
    return response.data.map(cidade => ({
      value: cidade.id,
      label: cidade.estado
        ? `${cidade.nome} - ${cidade.estado.sigla}`
        : cidade.nome
    }))
  }, [httpClient])

  /** Busca usuários por nome. Endpoint já existente: GET /usuarios. */
  const buscarParticipantes = useCallback(async (nome: string): Promise<SelectOption[]> => {
    const params: Record<string, string | number> = {
      pagina: 1,
      limite: BUSCA_LIMITE
    }
    if (nome.trim()) params.nome = nome.trim()

    const response = await httpClient.get<UsuariosListResponse>('/usuarios', params)
    return response.data.usuarios.map(usuario => ({
      value: usuario.id,
      label: usuario.nome
    }))
  }, [httpClient])

  /**
   * Cria a expedição.
   * Enquanto o contrato não estiver alinhado, lança `ContratoNaoAlinhadoError`
   * em vez de disparar um POST contra um endpoint hipotético.
   */
  const criarExpedicao = useCallback(async (values: NovaExpedicaoFormValues) => {
    if (!CONTRATO_ALINHADO) {
      throw new ContratoNaoAlinhadoError()
    }

    const response = await postExpedicao(toCreateExpedicaoPayload(values))
    return response?.status === 201
  }, [postExpedicao])

  return {
    buscarCidades,
    buscarParticipantes,
    criarExpedicao
  }
}
