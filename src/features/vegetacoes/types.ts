export interface VegetacaoListItem {
  id: number
  nome: string
}

export interface VegetacoesListMetadata {
  total?: number
  pagina?: number
  limite?: number
}

export interface VegetacoesListResponse {
  vegetacoes: VegetacaoListItem[]
  metadados: VegetacoesListMetadata
}

export interface VegetacoesApiObjectResponse {
  vegetacoes?: VegetacaoListItem[]
  resultado?: VegetacaoListItem[]
  metadados?: VegetacoesListMetadata
}

export type VegetacoesApiResponse = VegetacaoListItem[] | VegetacoesApiObjectResponse
