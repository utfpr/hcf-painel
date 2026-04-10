import type { ReactNode } from 'react'

export interface ReinoOption {
  id: number | string
  nome: string
}

export interface Familia {
  id: number | string
  nome: string
  reino?: ReinoOption | null
}

export interface FamiliaFilters {
  familia?: string
}

export interface FamiliaSearchFormValues {
  familia: string
}

export interface FamiliaFormValues {
  nome: string
  reinoId: number | string | undefined
}

export interface FamiliaMetadata {
  total: number
  page: number
  limit: number
}

export interface FamiliaTableRow {
  key: number | string
  familia: string
  reino: string
  action?: ReactNode
}

export interface FamiliaSorter {
  field?: string
  order?: 'ascend' | 'descend'
}

export interface FamiliaListApiResponse {
  resultado: Familia[]
  metadados: {
    total: number
    pagina: number
    limite: number
  }
}

export interface FamiliaListResult {
  results: Familia[]
  metadata: FamiliaMetadata
}

export interface ReinoListApiResponse {
  resultado: ReinoOption[]
  metadados: {
    total: number
    pagina: number
    limite: number
  }
}
