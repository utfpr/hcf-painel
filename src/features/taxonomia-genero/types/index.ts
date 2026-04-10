import type { ReactNode } from 'react'

export interface ReinoOption {
  id: number | string
  nome: string
}

export interface FamiliaOption {
  id: number | string
  nome: string
}

export interface Genero {
  id: number | string
  nome: string
  familia?: {
    id: number | string
    nome: string
    reino?: ReinoOption | null
  } | null
}

export interface GeneroFilters {
  genero?: string
  familia?: string
}

export interface GeneroSearchFormValues {
  genero: string
  familia: string
}

export interface GeneroFormValues {
  nomeGenero: string
  reinoId: number | string | undefined
  familiaId: number | string | undefined
}

export interface GeneroMetadata {
  total: number
  page: number
  limit: number
}

export interface GeneroTableRow {
  key: number | string
  genero: string
  familia: string
  action?: ReactNode
}

export interface GeneroSorter {
  field?: string
  order?: 'ascend' | 'descend'
}

export interface GeneroListApiResponse {
  resultado: Genero[]
  metadados: {
    total: number
    pagina: number
    limite: number
  }
}

export interface GeneroListResult {
  results: Genero[]
  metadata: GeneroMetadata
}

export interface ReinoListApiResponse {
  resultado: ReinoOption[]
  metadados: {
    total: number
    pagina: number
    limite: number
  }
}

export interface FamiliaListApiResponse {
  resultado: FamiliaOption[]
  metadados: {
    total: number
    pagina: number
    limite: number
  }
}
