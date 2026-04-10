import type { ReactNode } from 'react'

export interface ReinoOption {
  id: number | string
  nome: string
}

export interface FamiliaOption {
  id: number | string
  nome: string
}

export interface Subfamilia {
  id: number | string
  nome: string
  autor?: { nome?: string } | null
  familia?: {
    id: number | string
    nome: string
    reino?: ReinoOption | null
  } | null
}

export interface SubfamiliaFilters {
  subfamilia?: string
  familia?: string
}

export interface SubfamiliaSearchFormValues {
  subfamilia: string
  familia: string
}

export interface SubfamiliaFormValues {
  nomeSubfamilia: string
  reinoId: number | string | undefined
  familiaId: number | string | undefined
}

export interface SubfamiliaMetadata {
  total: number
  page: number
  limit: number
}

export interface SubfamiliaTableRow {
  key: number | string
  subfamilia: string
  familia: string
  autor: string
  action?: ReactNode
}

export interface SubfamiliaSorter {
  field?: string
  order?: 'ascend' | 'descend'
}

export interface SubfamiliaListApiResponse {
  resultado: Subfamilia[]
  metadados: {
    total: number
    pagina: number
    limite: number
  }
}

export interface SubfamiliaListResult {
  results: Subfamilia[]
  metadata: SubfamiliaMetadata
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
