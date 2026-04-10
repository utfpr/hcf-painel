import type { ReactNode } from 'react'

/** Item retornado por GET /taxonomias */
export interface TaxonomiaListItem {
  hcf: number | string
  familia: string
  sub_familia: string
  genero: string
  especie: string
  sub_especie: string
  variedade: string
}

export interface TaxonomiaFilters {
  familia?: string
  subfamilia?: string
  genero?: string
  especie?: string
  subespecie?: string
  variedade?: string
}

export interface TaxonomiaSearchFormValues {
  familia: string
  subfamilia: string
  genero: string
  especie: string
  subespecie: string
  variedade: string
}

export interface TaxonomiaMetadata {
  total: number
  page: number
  limit: number
}

export interface TaxonomiaTableRow {
  key: number | string
  familia: string
  subfamilia: string
  genero: string
  especie: string
  subespecie: string
  variedade: string
  acao?: ReactNode
}

export interface TaxonomiaListApiResponse {
  resultado: TaxonomiaListItem[]
  metadados: {
    total: number
    pagina: number
    limite: number
  }
}

export interface TaxonomiaListResult {
  results: TaxonomiaListItem[]
  metadata: TaxonomiaMetadata
}
