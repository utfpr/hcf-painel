export interface RfidVinculo {
  id: number
  epc?: string
  tid?: string | null
  status?: string
  tombos_foto?: {
    tombo_hcf?: string
    codigo_barra?: string
    caminho_foto?: string | null
  }
  TomboFoto?: {
    tombo_hcf?: string
    codigo_barra?: string
    caminho_foto?: string | null
  }
}

export interface PaginacaoRfids {
  current: number
  pageSize: number
  total: number
}

export interface FiltrosRfids {
  tombo_hcf?: string
  familia_id?: number[]
  genero_id?: number[]
  especie_id?: number[]
}
