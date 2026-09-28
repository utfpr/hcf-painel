import { useCallback } from 'react'

import { useContainer } from '@/contexts/Container/useContainer'
import { useMutation } from '@/hooks/query/useMutation'

import {
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
const STATUS_CREATED = 201

export function useNovaExpedicaoPage() {
  const { httpClient } = useContainer()

  const { trigger: postExpedicao } = useMutation(

    (payload: CreateExpedicaoPayload) => httpClient.post(EXPEDICOES_ENDPOINT, payload),
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


  const criarExpedicao = useCallback(async (values: NovaExpedicaoFormValues) => {
    const response = await postExpedicao(toCreateExpedicaoPayload(values))
    return response?.status === STATUS_CREATED
  }, [postExpedicao])

  return {
    buscarCidades,
    buscarParticipantes,
    criarExpedicao
  }
}
