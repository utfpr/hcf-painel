import type { ReactNode } from 'react'

export interface ReinoOption {
  id: number | string
  nome: string
}

export interface FamiliaOption {
  id: number | string
  nome: string
}

export interface GeneroOption {
  id: number | string
  nome: string
}

export interface AutorOption {
  id: number | string
  nome: string
}

export interface Especie {
  id: number | string
  nome: string
  autor?: { id?: number | string; nome?: string } | null
  genero?: {
    id: number | string
    nome: string
    familia?: {
      id: number | string
      nome: string
      reino?: ReinoOption | null
    } | null
  } | null
}

export interface EspecieFilters {
  especie?: string
  familia?: string
  genero?: string
}

export interface EspecieSearchFormValues {
  especie: string
  familia: string
  genero: string
}

export interface EspecieFormValues {
  nomeEspecie: string
  reinoId: number | string | undefined
  familiaId: number | string | undefined
  generoId: number | string | undefined
  autorId: number | string | undefined
}

export interface EspecieMetadata {
  total: number
  page: number
  limit: number
}

export interface EspecieTableRow {
  key: number | string
  especie: string
  familia: string
  genero: string
  autor: string
  action?: ReactNode
}

export interface EspecieSorter {
  field?: string
  order?: 'ascend' | 'descend'
}

export interface EspecieListApiResponse {
  resultado: Especie[]
  metadados: {
    total: number
    pagina: number
    limite: number
  }
}

export interface EspecieListResult {
  results: Especie[]
  metadata: EspecieMetadata
}

export interface ListApiResponse<T> {
  resultado: T[]
  metadados: {
    total: number
    pagina: number
    limite: number
  }
}
