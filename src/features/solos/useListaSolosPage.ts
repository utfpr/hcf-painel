import { useState } from 'react'

import { useContainer } from '@/contexts/Container/useContainer'
import { useQuery } from '@/hooks/query/useQuery'
import type { HttpClient } from '@/libraries/http/HttpClient'

import { solosListParams, type SolosSorter } from './search'
import type {
  SolosApiResponse,
  SolosListResponse
} from './types'

export async function fetchSolos(
  httpClient: Pick<HttpClient, 'get'>,
  params: Record<string, string | number>
): Promise<SolosListResponse> {
  const response = await httpClient.get<SolosApiResponse>('/v1/solos', params)
  const data = response.data
  const solos = Array.isArray(data)
    ? data
    : data.solos ?? data.resultado ?? []
  const requestedPage = Number(params.pagina ?? 1)
  const requestedLimit = Number(params.limite ?? solos.length)

  return {
    solos,
    metadados: Array.isArray(data)
      ? {
        total: solos.length,
        pagina: requestedPage,
        limite: requestedLimit
      }
      : data.metadados ?? {
        total: solos.length,
        pagina: requestedPage,
        limite: requestedLimit
      }
  }
}

export function useListaSolosPage() {
  const { httpClient } = useContainer()
  const [nome, setNome] = useState('')
  const [pagina, setPagina] = useState(1)
  const [limite, setLimite] = useState(20)
  const [sorter, setSorter] = useState<SolosSorter>()
  const params = solosListParams(nome, pagina, limite, sorter)

  const {
    data, loading, error
  } = useQuery(
    () => fetchSolos(httpClient, params),
    [
      '/v1/solos',
      nome,
      pagina,
      limite,
      sorter?.field,
      sorter?.order
    ],
    { keepPreviousData: true }
  )

  const search = (value: string) => {
    setNome(value)
    setPagina(1)
    setSorter(undefined)
  }

  const changePage = (
    nextPagina: number,
    nextLimite?: number,
    nextSorter?: SolosSorter
  ) => {
    setPagina(nextPagina)
    if (nextLimite) setLimite(nextLimite)
    setSorter(nextSorter)
  }

  return {
    solos: data?.solos ?? [],
    metadados: data?.metadados ?? {},
    loading,
    error,
    search,
    changePage
  }
}
