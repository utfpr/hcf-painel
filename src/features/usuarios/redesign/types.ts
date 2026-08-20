export interface UsuarioListFilters {
  nome?: string
  email?: string
  tipo?: string
  telefone?: string
}

export interface UsuarioListItem {
  id: number
  nome: string
  email: string
  ra?: string
  herbario_id?: number
  telefone?: string
  tipos_usuario: {
    id: number
    tipo: string
    created_at: string
  }
}

export interface UsuariosMetadados {
  total?: number
  pagina?: number
  limite?: number
}

export interface UsuariosListResponse {
  usuarios: UsuarioListItem[]
  metadados: UsuariosMetadados
}

export interface UsuarioRow {
  key: number
  nome: string
  email: string
  tipo: string
  tipoId: number
  telefone: string
  dataCriacao: string
}

export interface CreateUsuarioPayload {
  nome: string
  email: string
  senha: string
  tipo_usuario_id: number
  herbario_id: number
  telefone?: string
  ra?: string
}

export const USER_COLUMN_KEYS = [
  'nome',
  'tipo',
  'email',
  'telefone',
  'dataCriacao'
] as const

export type UserColumnKey = typeof USER_COLUMN_KEYS[number]

export const DEFAULT_USER_COLUMNS: UserColumnKey[] = [...USER_COLUMN_KEYS]
export const PAGE_SIZE_OPTIONS = [
  20,
  50,
  100
] as const
export const DEFAULT_PAGE_SIZE = 20
