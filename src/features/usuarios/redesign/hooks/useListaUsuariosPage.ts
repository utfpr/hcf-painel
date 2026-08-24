import { useCallback, useMemo } from 'react'

import { useSearchParams } from 'react-router'

import { useContainer } from '@/contexts/Container/useContainer'
import { formatarDataBDtoDataHora } from '@/helpers/conversoes/ConversoesData'
import { telefoneToFrontEnd } from '@/helpers/conversoes/ConversoesTelefone'
import { useMutation } from '@/hooks/query/useMutation'
import { useQuery } from '@/hooks/query/useQuery'
import { useLocalStorage } from '@/hooks/useLocalStorage'

import { toSearchFilters } from '../search'
import type {
  CreateUsuarioPayload,
  UsuarioListFilters,
  UsuarioListItem,
  UsuarioRow,
  UsuariosListResponse
} from '../types'
import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS
} from '../types'

const PAGE_SIZE_STORAGE_KEY = 'hcf.users.pageSize'
const USUARIOS_REVALIDATE = [['/usuarios']] as const

function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function toRow(item: UsuarioListItem): UsuarioRow {
  return {
    key: item.id,
    nome: item.nome,
    email: item.email,
    tipo: item.tipos_usuario.tipo.toLowerCase(),
    tipoId: item.tipos_usuario.id,
    telefone: asString(telefoneToFrontEnd(item.telefone) as unknown),
    dataCriacao: asString(formatarDataBDtoDataHora(item.tipos_usuario.created_at) as unknown)
  }
}

function parsePageSize(value: string | null, fallback: number): number {
  const parsed = Number(value)
  if ((PAGE_SIZE_OPTIONS as readonly number[]).includes(parsed)) return parsed
  return fallback
}

function parsePage(value: string | null): number {
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < 1) return 1
  return parsed
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

export function useListaUsuariosPage() {
  const { httpClient } = useContainer()
  const [searchParams, setSearchParams] = useSearchParams()
  const [storedPageSize, setStoredPageSize] = useLocalStorage<number>(
    PAGE_SIZE_STORAGE_KEY,
    DEFAULT_PAGE_SIZE
  )

  const query = searchParams.get('q') ?? ''
  const tipo = searchParams.get('role') ?? ''
  const pagina = parsePage(searchParams.get('page'))
  const pageSize = parsePageSize(
    searchParams.get('pageSize'),
    parsePageSize(
      storedPageSize === undefined || storedPageSize === null
        ? null
        : String(storedPageSize),
      DEFAULT_PAGE_SIZE
    )
  )

  const filters = useMemo<UsuarioListFilters>(() => ({
    ...toSearchFilters(query),
    ...(tipo ? { tipo } : {})
  }), [query, tipo])

  const hasActiveFilters = Boolean(query.trim() || tipo)

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

  const replaceParams = useCallback((updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === '') next.delete(key)
      else next.set(key, value)
    }
    setSearchParams(next, { replace: true })
  }, [searchParams, setSearchParams])

  const setQuery = useCallback((nextQuery: string) => {
    replaceParams({
      q: nextQuery.trim(),
      page: null
    })
  }, [replaceParams])

  const setRole = useCallback((nextRole: string) => {
    replaceParams({
      role: nextRole,
      page: null
    })
  }, [replaceParams])

  const clearFilters = useCallback(() => {
    replaceParams({
      q: null,
      role: null,
      page: null
    })
  }, [replaceParams])

  const changePage = useCallback((nextPagina: number, nextPageSize?: number) => {
    const updates: Record<string, string | null> = {
      page: nextPagina > 1 ? String(nextPagina) : null
    }
    if (nextPageSize && nextPageSize !== pageSize) {
      updates.pageSize = String(nextPageSize)
      updates.page = null
      setStoredPageSize(nextPageSize)
    }
    replaceParams(updates)
  }, [
    pageSize,
    replaceParams,
    setStoredPageSize
  ])

  const { trigger: removeUsuario } = useMutation(
    (id: number) => httpClient.delete(`/usuarios/${id}`),
    ['/usuarios', 'delete'],
    { revalidate: USUARIOS_REVALIDATE }
  )

  const { trigger: createUsuario } = useMutation(
    (payload: CreateUsuarioPayload) => httpClient.post<CreateUsuarioPayload>(
      '/usuarios',
      payload
    ),
    ['/usuarios', 'create'],
    { revalidate: USUARIOS_REVALIDATE }
  )

  const remove = useCallback(async (id: number) => {
    const response = await removeUsuario(id)
    return response?.status === 204
  }, [removeUsuario])

  const create = useCallback(async (payload: CreateUsuarioPayload) => {
    const response = await createUsuario(payload)
    return response?.status === 201
  }, [createUsuario])

  return {
    usuarios: data?.usuarios.map(toRow) ?? [],
    metadados: data?.metadados ?? {},
    loading,
    error,
    query,
    role: tipo,
    pagina,
    pageSize,
    hasActiveFilters,
    setQuery,
    setRole,
    clearFilters,
    changePage,
    remove,
    create,
    refresh
  }
}
