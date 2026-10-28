import { useCallback, useMemo } from 'react'

import { useContainer } from '@/contexts/Container/useContainer'
import { useMutation } from '@/hooks/query/useMutation'
import { useQuery } from '@/hooks/query/useQuery'

import {
  diffParticipantes,
  EXPEDICOES_V2_ENDPOINT,
  idFromField,
  rotasIguais,
  toUpdateExpedicaoPayload,
  toUpdateRotasPayload,
  type EditarExpedicaoFormValues,
  type ExpedicaoDetalhada,
  type UpdateExpedicaoPayload
} from '../api/expedicaoEdicaoContract'
import type {
  CidadeListItem,
  LocalColetaItem,
  LocaisColetaResponse,
  SelectOption,
  UsuariosListResponse
} from '../types'

const BUSCA_LIMITE = 20

interface SalvarArgs {
  original: ExpedicaoDetalhada
  values: EditarExpedicaoFormValues
}

export function useEditarExpedicaoPage(expedicaoId: number | undefined) {
  const { httpClient } = useContainer()

  const {
    data: expedicao,
    error: erroCarregamento,
    loading: carregando
  } = useQuery(
    async () => {
      const response = await httpClient.get<ExpedicaoDetalhada>(
        `${EXPEDICOES_V2_ENDPOINT}/${expedicaoId}`
      )
      return response.data
    },
    expedicaoId ? [EXPEDICOES_V2_ENDPOINT, 'detalhe', expedicaoId] : null
  )

  // Nome da cidade de destino: o GET da expedição só devolve o cidade_id.
  const { data: cidadeDestino } = useQuery(
    async () => {
      const response = await httpClient.get<CidadeListItem>(
        `/cidades/${expedicao?.cidade_id}`
      )
      return response.data
    },
    expedicao ? ['/cidades', 'detalhe', expedicao.cidade_id] : null
  )

  const destinoInicial = useMemo<SelectOption[]>(() => {
    if (!expedicao) return []
    if (!cidadeDestino?.nome) {
      return [{ value: Number(expedicao.cidade_id), label: String(Number(expedicao.cidade_id)) }]
    }
    return [{
      value: Number(expedicao.cidade_id),
      label: cidadeDestino.estado
        ? `${cidadeDestino.nome} - ${cidadeDestino.estado.sigla}`
        : cidadeDestino.nome
    }]
  }, [expedicao, cidadeDestino])

  const { trigger: salvarMutation } = useMutation(
    async ({ original, values }: SalvarArgs) => {
      const base = `${EXPEDICOES_V2_ENDPOINT}/${original.id}`

      // 1) dados básicos
      await httpClient.put<UpdateExpedicaoPayload>(
        base,
        toUpdateExpedicaoPayload(values)
      )

      const rotasPayload = toUpdateRotasPayload(values)
      if (!rotasIguais(original.rotas, rotasPayload.rotas)) {
        await httpClient.put(`${base}/rotas`, rotasPayload)
      }

      // participantes (a API só adiciona/remove um a um)
      const { adicionar, remover } = diffParticipantes(
        original.participantes.map(p => Number(p.id)),
        values.participantes.map(idFromField)
      )
      for (const usuarioId of adicionar) {
        await httpClient.post(`${base}/participantes`, { usuarioId: Number(usuarioId) })
      }
      for (const usuarioId of remover) {
        await httpClient.delete(`${base}/participantes/${Number(usuarioId)}`)
      }
      return true
    },
    [EXPEDICOES_V2_ENDPOINT, 'update'],
    { revalidate: [[EXPEDICOES_V2_ENDPOINT]] }
  )

  const salvar = useCallback(
    (values: EditarExpedicaoFormValues) => {
      if (!expedicao) return Promise.resolve(false)
      return salvarMutation({ original: expedicao, values })
    },
    [expedicao, salvarMutation]
  )

  const buscarCidades = useCallback(async (nome: string): Promise<SelectOption[]> => {
    const params: Record<string, string | number> = {}
    if (nome.trim()) params.nome = nome.trim()
    const response = await httpClient.get<CidadeListItem[]>('/cidades', params)
    return response.data.map(cidade => ({
  value: Number(cidade.id),
  label: cidade.estado
    ? `${cidade.nome} - ${cidade.estado.sigla}`
    : cidade.nome
}))
  }, [httpClient])

  const buscarLocaisColeta = useCallback(async (cidadeId: number): Promise<LocalColetaItem[]> => {
    const response = await httpClient.get<LocaisColetaResponse>('/locais-coleta', {
      cidade_id: cidadeId,
      getAll: 'true'
    })
    return response.data.resultado ?? []
  }, [httpClient])

  const buscarParticipantes = useCallback(async (nome: string): Promise<SelectOption[]> => {
    const params: Record<string, string | number> = {
      pagina: 1,
      limite: BUSCA_LIMITE
    }
    if (nome.trim()) params.nome = nome.trim()
    const response = await httpClient.get<UsuariosListResponse>('/usuarios', params)
    return response.data.usuarios.map(usuario => ({
  value: Number(usuario.id),
  label: usuario.nome
}))
  }, [httpClient])

  return {
    expedicao,
    erroCarregamento,
    carregando,
    destinoInicial,
    buscarCidades,
    buscarLocaisColeta,
    buscarParticipantes,
    salvar
  }
}
