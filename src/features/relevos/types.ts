export interface RelevoListItem {
  id: number | string
  nome: string
}

export interface RelevosListMetadata {
  total?: number
  pagina?: number
  limite?: number
}

export interface RelevosListResponse {
  relevos: RelevoListItem[]
  metadados: RelevosListMetadata
}

export interface RelevosApiObjectResponse {
  relevos?: RelevoListItem[]
  resultado?: RelevoListItem[]
  metadados?: RelevosListMetadata
}

export type RelevosApiResponse = RelevoListItem[] | RelevosApiObjectResponse
