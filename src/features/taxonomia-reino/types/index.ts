import type { ReactNode } from 'react'

export interface Reino {
  id: number | string
  nome: string
}

/** Filter parameters sent to the API */
export interface ReinoFilters {
  reino?: string
}

/** Search form for the listing */
export interface ReinoSearchFormValues {
  reino: string
}

/** Form for the create/edit modal */
export interface ReinoFormValues {
  reinoName: string
}

export interface ReinoMetadata {
  total: number
  page: number
  limit: number
}

export interface ReinoTableRow {
  key: number | string
  reino: string
  action?: ReactNode
}

export interface ReinoSorter {
  field?: string
  order?: 'ascend' | 'descend'
}

/** Raw list response from GET /reinos (backend field names) */
export interface ReinoListApiResponse {
  resultado: Reino[]
  metadados: {
    total: number
    pagina: number
    limite: number
  }
}

/** Normalized list result used in the app layer */
export interface ReinoListResult {
  results: Reino[]
  metadata: ReinoMetadata
}
