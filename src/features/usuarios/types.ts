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
  telefone: string
  dataCriacao: string
}
