
export interface CidadeListItem {
  id: number
  nome: string
  estado?: {
    id: number
    nome: string
    sigla: string
  }
}

export interface UsuarioListItem {
  id: number
  nome: string
  email: string
}

export interface UsuariosListResponse {
  usuarios: UsuarioListItem[]
  metadados: {
    total: number
  }
}

export interface SelectOption {
  value: number
  label: string
}
