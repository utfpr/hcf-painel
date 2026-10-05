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

export interface LocalColetaItem {
  id: number | string
  descricao: string
}

export interface LocaisColetaResponse {
  resultado?: LocalColetaItem[]
}

/** Cidade na rota do formulário. A posição no array é a ordem. Os locais não têm ordem. */
export interface ParadaRotaForm {
  value: number | string
  label: string
  locaisColetaIds?: number[]
}

export interface RotaExpedicaoPayload {
  cidade_id: number
  locais_coleta_ids: number[]
}
