import type { ReactNode } from 'react'

export interface Autor {
  id: number | string
  nome: string
  observacao?: string | null
}

export interface AutorFilters {
  autor?: string
}

export interface AutorSearchFormValues {
  autor: string
}

export interface AutorFormValues {
  nome: string
  observacao: string
}

export interface AutorMetadata {
  total: number
  page: number
  limit: number
}

export interface AutorTableRow {
  key: number | string
  autor: string
  observacao: string
  action?: ReactNode
}

export interface AutorSorter {
  field?: string
  order?: 'ascend' | 'descend'
}

export interface AutorListApiResponse {
  resultado: Autor[]
  metadados: {
    total: number
    pagina: number
    limite: number
  }
}

export interface AutorListResult {
  results: Autor[]
  metadata: AutorMetadata
}
