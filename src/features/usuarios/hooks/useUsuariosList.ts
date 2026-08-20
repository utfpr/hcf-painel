import { useCallback, useState } from 'react'

import { useContainer } from '@/contexts/Container/useContainer'
import { formatarDataBDtoDataHora } from '@/helpers/conversoes/ConversoesData'
import { telefoneToFrontEnd } from '@/helpers/conversoes/ConversoesTelefone'
import { useQuery } from '@/hooks/query/useQuery'

import type {
  UsuarioListFilters,
  UsuarioListItem,
  UsuarioRow,
  UsuariosListResponse
} from '../types'

function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function toRow(item: UsuarioListItem): UsuarioRow {
  return {
    key: item.id,
    nome: item.nome,
    email: item.email,
    tipo: item.tipos_usuario.tipo.toLowerCase(),
    telefone: asString(telefoneToFrontEnd(item.telefone) as unknown),
    dataCriacao: asString(formatarDataBDtoDataHora(item.tipos_usuario.created_at) as unknown)
  }
}

function listParams(
  filters: UsuarioListFilters,
  pagina: number,
  pageSize: number
): Record<string, string | number> {
  const params: Record<string, string | number> = {
    pagina,
    limite: pageSize
  }

  if (filters.nome) params.nome = filters.nome
  if (filters.email) params.email = filters.email
  if (filters.tipo) params.tipo = filters.tipo
  if (filters.telefone) params.telefone = filters.telefone

  return params
}

export function useUsuariosList() {
  const { httpClient } = useContainer()
  const [filters, setFilters] = useState<UsuarioListFilters>({})
  const [pagina, setPagina] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const {
    data, loading, error, refresh
  } = useQuery(
    async () => {
      const response = await httpClient.get<UsuariosListResponse>(
        '/usuarios',
        listParams(filters, pagina, pageSize)
      )
      return response.data
    },
    [
      '/usuarios',
      filters,
      pagina,
      pageSize
    ],
    { keepPreviousData: true }
  )

  const search = useCallback((nextFilters: UsuarioListFilters) => {
    setPagina(1)
    setFilters(nextFilters)
  }, [])

  const clear = useCallback(() => {
    setPagina(1)
    setFilters({})
  }, [])

  const changePage = useCallback((nextPagina: number, nextPageSize?: number) => {
    setPagina(nextPagina)
    if (nextPageSize) setPageSize(nextPageSize)
  }, [])

  const remove = useCallback(async (id: number) => {
    const response = await httpClient.delete(`/usuarios/${id}`)
    if (response.status === 204) {
      await refresh()
      return true
    }
    return false
  }, [httpClient, refresh])

  return {
    usuarios: data?.usuarios.map(toRow) ?? [],
    metadados: data?.metadados ?? {},
    loading,
    error,
    search,
    clear,
    changePage,
    remove
  }
}
