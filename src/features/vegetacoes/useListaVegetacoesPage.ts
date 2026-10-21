import { useState } from 'react'

import useSWR from 'swr'

import { useContainer } from '@/contexts/Container/useContainer'
import type { HttpClient } from '@/libraries/http/HttpClient'

import { vegetacoesListParams, type VegetacoesSorter } from './search'
import type {
  VegetacoesApiResponse,
  VegetacoesListResponse
} from './types'

export async function fetchVegetacoes(
  httpClient: Pick<HttpClient, 'get'>,
  params: Record<string, string | number>
): Promise<VegetacoesListResponse> {
  const response = await httpClient.get<VegetacoesApiResponse>('/v2/vegetacoes', params)
  const data = response.data
  const vegetacoes = Array.isArray(data)
    ? data
    : data.vegetacoes ?? data.resultado ?? []
  const requestedPage = Number(params.pagina ?? 1)
  const requestedLimit = Number(params.limite ?? vegetacoes.length)

  return {
    vegetacoes,
    metadados: Array.isArray(data)
      ? {
        total: vegetacoes.length,
        pagina: requestedPage,
        limite: requestedLimit
      }
      : data.metadados ?? {
        total: vegetacoes.length,
        pagina: requestedPage,
        limite: requestedLimit
      }
  }
}

export function useListaVegetacoesPage() {
  const { httpClient } = useContainer()
  const [nome, setNome] = useState('')
  const [pagina, setPagina] = useState(1)
  const [limite, setLimite] = useState(20)
  const [sorter, setSorter] = useState<VegetacoesSorter>()
  const params = vegetacoesListParams(nome, pagina, limite, sorter)

  const {
    data, isLoading: loading, error
  } = useSWR<VegetacoesListResponse, Error>(
    [
      '/v2/vegetacoes',
      nome,
      pagina,
      limite,
      sorter?.field,
      sorter?.order
    ],
    () => fetchVegetacoes(httpClient, params),
    {
      keepPreviousData: true,
      shouldRetryOnError: false
    }
  )

  const search = (value: string) => {
    setNome(value)
    setPagina(1)
    setSorter(undefined)
  }

  const changePage = (
    nextPagina: number,
    nextLimite?: number,
    nextSorter?: VegetacoesSorter
  ) => {
    setPagina(nextPagina)
    if (nextLimite) setLimite(nextLimite)
    setSorter(nextSorter)
  }

  return {
    vegetacoes: data?.vegetacoes ?? [],
    metadados: data?.metadados ?? {},
    loading,
    error,
    search,
    changePage
  }
}
