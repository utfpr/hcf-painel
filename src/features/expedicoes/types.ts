
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

/** Valor do Select: o campo fica com o label. O id sai só no payload. */
export interface OpcaoSelecionada {
  value: number | string
  label: string
}
