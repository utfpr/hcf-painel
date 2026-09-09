import { useCallback } from 'react'

import { useContainer } from '@/contexts/Container/useContainer'
import { formatarDataBDtoDataHora } from '@/helpers/conversoes/ConversoesData'
import { telefoneToFrontEnd } from '@/helpers/conversoes/ConversoesTelefone'
import { useMutation } from '@/hooks/query/useMutation'

import { toSearchFilters } from '../search'
import type {
  CreateUsuarioPayload,
  UsuarioListItem,
  UsuarioRow,
  UsuariosListResponse
} from '../types'

const USUARIOS_REVALIDATE = [['/usuarios']] as const

export type UsuarioQuery = {
  q: string
  role: string
  sort: string
  order: string
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

export function toUsuarioRow(item: UsuarioListItem): UsuarioRow {
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

export function usuarioListParams(
  query: UsuarioQuery,
  pagina: number,
  pageSize: number
): Record<string, string | number> {
  const params: Record<string, string | number> = {
    pagina,
    limite: pageSize
  }

  const filters = toSearchFilters(query.q)
  if (filters.nome) params.nome = filters.nome
  if (filters.email) params.email = filters.email
  if (filters.telefone) params.telefone = filters.telefone
  if (query.role) params.tipo = query.role

  // GET /usuarios still hardcodes ORDER BY id DESC; do not send sort until the API accepts it.
  return params
}

export function useListaUsuariosPage() {
  const { httpClient } = useContainer()

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

  const fetchUsuarios = useCallback(async (
    query: UsuarioQuery,
    page: number,
    pageSize: number
  ) => {
    const response = await httpClient.get<UsuariosListResponse>(
      '/usuarios',
      usuarioListParams(query, page, pageSize)
    )
    return {
      rows: response.data.usuarios.map(toUsuarioRow),
      total: response.data.metadados.total ?? 0
    }
  }, [httpClient])

  return {
    fetchUsuarios,
    remove,
    create
  }
}
