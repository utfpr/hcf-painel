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

export interface EspecieOption {
  id: number | string
  nome: string
}

export interface AutorOption {
  id: number | string
  nome: string
}

export interface Subespecie {
  id: number | string
  nome: string
  autor?: { id?: number | string; nome?: string } | null
  especie?: {
    id: number | string
    nome: string
    genero?: {
      id: number | string
      nome: string
      familia?: {
        id: number | string
        nome: string
        reino?: ReinoOption | null
      } | null
    } | null
  } | null
}

export interface SubespecieFilters {
  subespecie?: string
  familia?: string
  genero?: string
  especie?: string
}

export interface SubespecieSearchFormValues {
  subespecie: string
  familia: string
  genero: string
  especie: string
}

export interface SubespecieFormValues {
  nomeSubespecie: string
  reinoId: number | string | undefined
  familiaId: number | string | undefined
  generoId: number | string | undefined
  especieId: number | string | undefined
  autorId: number | string | undefined
}

export interface SubespecieMetadata {
  total: number
  page: number
  limit: number
}

export interface SubespecieTableRow {
  key: number | string
  subespecie: string
  especie: string
  familia: string
  genero: string
  autor: string
  action?: ReactNode
}

export interface SubespecieSorter {
  field?: string
  order?: 'ascend' | 'descend'
}

export interface SubespecieListApiResponse {
  resultado: Subespecie[]
  metadados: {
    total: number
    pagina: number
    limite: number
  }
}

export interface SubespecieListResult {
  results: Subespecie[]
  metadata: SubespecieMetadata
}

export interface ListApiResponse<T> {
  resultado: T[]
  metadados: {
    total: number
    pagina: number
    limite: number
  }
}
