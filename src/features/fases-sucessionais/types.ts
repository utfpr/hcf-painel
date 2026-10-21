export interface FaseSucessionalListItem {
  id: number | string
  nome: string
}

export interface FasesSucessionaisListMetadata {
  total?: number
  pagina?: number
  limite?: number
}

export interface FasesSucessionaisListResponse {
  fasesSucessionais: FaseSucessionalListItem[]
  metadados: FasesSucessionaisListMetadata
}

export interface FasesSucessionaisApiObjectResponse {
  fasesSucessionais?: FaseSucessionalListItem[]
  resultado?: FaseSucessionalListItem[]
  metadados?: FasesSucessionaisListMetadata
}

export type FasesSucessionaisApiResponse
  = | FaseSucessionalListItem[]
      | FasesSucessionaisApiObjectResponse
