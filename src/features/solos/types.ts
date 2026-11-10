export interface SoloListItem {
  id: number | string
  nome: string
}

export interface SolosListMetadata {
  total?: number
  pagina?: number
  limite?: number
}

export interface SolosListResponse {
  solos: SoloListItem[]
  metadados: SolosListMetadata
}

export interface SolosApiObjectResponse {
  solos?: SoloListItem[]
  resultado?: SoloListItem[]
  metadados?: SolosListMetadata
}

export type SolosApiResponse = SoloListItem[] | SolosApiObjectResponse
