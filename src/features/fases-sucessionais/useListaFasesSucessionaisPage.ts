import { useState } from 'react'

import useSWR from 'swr'

import { useContainer } from '@/contexts/Container/useContainer'
import type { HttpClient } from '@/libraries/http/HttpClient'

import {
  fasesSucessionaisListParams,
  type FasesSucessionaisSorter
} from './search'
import type {
  FasesSucessionaisApiResponse,
  FasesSucessionaisListResponse
} from './types'

export async function fetchFasesSucessionais(
  httpClient: Pick<HttpClient, 'get'>,
  params: Record<string, string | number>
): Promise<FasesSucessionaisListResponse> {
  const response = await httpClient.get<FasesSucessionaisApiResponse>(
    '/v2/fases-sucessionais',
    params
  )
  const data = response.data
  const fasesSucessionais = Array.isArray(data)
    ? data
    : data.fasesSucessionais ?? data.resultado ?? []
  const requestedPage = Number(params.pagina ?? 1)
  const requestedLimit = Number(params.limite ?? fasesSucessionais.length)

  return {
    fasesSucessionais,
    metadados: Array.isArray(data)
      ? {
        total: fasesSucessionais.length,
        pagina: requestedPage,
        limite: requestedLimit
      }
      : data.metadados ?? {
        total: fasesSucessionais.length,
        pagina: requestedPage,
        limite: requestedLimit
      }
  }
}

export function useListaFasesSucessionaisPage() {
  const { httpClient } = useContainer()
  const [nome, setNome] = useState('')
  const [pagina, setPagina] = useState(1)
  const [limite, setLimite] = useState(20)
  const [sorter, setSorter] = useState<FasesSucessionaisSorter>()
  const params = fasesSucessionaisListParams(nome, pagina, limite, sorter)

  const {
    data, isLoading: loading, error
  } = useSWR<FasesSucessionaisListResponse, Error>(
    [
      '/v2/fases-sucessionais',
      nome,
      pagina,
      limite,
      sorter?.field,
      sorter?.order
    ],
    () => fetchFasesSucessionais(httpClient, params),
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
    nextSorter?: FasesSucessionaisSorter
  ) => {
    setPagina(nextPagina)
    if (nextLimite) setLimite(nextLimite)
    setSorter(nextSorter)
  }

  return {
    fasesSucessionais: data?.fasesSucessionais ?? [],
    metadados: data?.metadados ?? {},
    loading,
    error,
    search,
    changePage
  }
}
