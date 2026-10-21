import { useState } from 'react'

import useSWR from 'swr'

import { useContainer } from '@/contexts/Container/useContainer'
import { useMutation } from '@/hooks/query/useMutation'
import type { HttpClient } from '@/libraries/http/HttpClient'

import { relevosListParams, type RelevosSorter } from './search'
import type {
  RelevosApiResponse,
  RelevosListResponse
} from './types'

const LIST_KEY = '/v2/relevos'
const REVALIDATE_LIST = [[LIST_KEY]] as const

export async function fetchRelevos(
  httpClient: Pick<HttpClient, 'get'>,
  params: Record<string, string | number>
): Promise<RelevosListResponse> {
  const response = await httpClient.get<RelevosApiResponse>('/v2/relevos', params)
  const data = response.data
  const relevos = Array.isArray(data)
    ? data
    : data.relevos ?? data.resultado ?? []
  const requestedPage = Number(params.pagina ?? 1)
  const requestedLimit = Number(params.limite ?? relevos.length)

  return {
    relevos,
    metadados: Array.isArray(data)
      ? {
        total: relevos.length,
        pagina: requestedPage,
        limite: requestedLimit
      }
      : data.metadados ?? {
        total: relevos.length,
        pagina: requestedPage,
        limite: requestedLimit
      }
  }
}

export function useListaRelevosPage() {
  const { httpClient } = useContainer()
  const { trigger: create, loading: creating } = useMutation(
    (nome: string) => httpClient.post<unknown>(LIST_KEY, { nome }),
    [LIST_KEY, 'create'],
    { revalidate: REVALIDATE_LIST }
  )
  const { trigger: update, loading: updating } = useMutation(
    (id: number | string, nome: string) => httpClient.put<unknown>(`${LIST_KEY}/${id}`, { nome }),
    [LIST_KEY, 'update'],
    { revalidate: REVALIDATE_LIST }
  )
  const { trigger: remove, loading: removing } = useMutation(
    (id: number | string) => httpClient.delete<unknown>(`${LIST_KEY}/${id}`),
    [LIST_KEY, 'delete'],
    { revalidate: REVALIDATE_LIST }
  )
  const [nome, setNome] = useState('')
  const [pagina, setPagina] = useState(1)
  const [limite, setLimite] = useState(20)
  const [sorter, setSorter] = useState<RelevosSorter>()
  const params = relevosListParams(nome, pagina, limite, sorter)

  const {
    data, isLoading: loading, error
  } = useSWR<RelevosListResponse, Error>(
    [
      LIST_KEY,
      nome,
      pagina,
      limite,
      sorter?.field,
      sorter?.order
    ],
    () => fetchRelevos(httpClient, params),
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
    nextSorter?: RelevosSorter
  ) => {
    setPagina(nextPagina)
    if (nextLimite) setLimite(nextLimite)
    setSorter(nextSorter)
  }

  return {
    relevos: data?.relevos ?? [],
    metadados: data?.metadados ?? {},
    loading,
    error,
    search,
    changePage,
    create,
    creating,
    update,
    updating,
    remove,
    removing
  }
}
