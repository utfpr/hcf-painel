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

export interface Variedade {
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

export interface VariedadeFilters {
  variedade?: string
  familia?: string
  genero?: string
  especie?: string
}

export interface VariedadeSearchFormValues {
  variedade: string
  familia: string
  genero: string
  especie: string
}

export interface VariedadeFormValues {
  nomeVariedade: string
  reinoId: number | string | undefined
  familiaId: number | string | undefined
  generoId: number | string | undefined
  especieId: number | string | undefined
  autorId: number | string | undefined
}

export interface VariedadeMetadata {
  total: number
  page: number
  limit: number
}

export interface VariedadeTableRow {
  key: number | string
  variedade: string
  especie: string
  familia: string
  genero: string
  autor: string
  action?: ReactNode
}

export interface VariedadeSorter {
  field?: string
  order?: 'ascend' | 'descend'
}

export interface VariedadeListApiResponse {
  resultado: Variedade[]
  metadados: {
    total: number
    pagina: number
    limite: number
  }
}

export interface VariedadeListResult {
  results: Variedade[]
  metadata: VariedadeMetadata
}

export interface ListApiResponse<T> {
  resultado: T[]
  metadados: {
    total: number
    pagina: number
    limite: number
  }
}
