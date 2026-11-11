export interface VegetacoesSorter {
  field?: string
  order?: 'ascend' | 'descend' | null
}

export function vegetacoesListParams(
  nome: string,
  pagina: number,
  limite: number,
  sorter?: VegetacoesSorter
): Record<string, string | number> {
  const params: Record<string, string | number> = { pagina, limite }
  const normalizedName = nome.trim()

  if (normalizedName) params.nome = normalizedName

  if ((sorter?.field === 'id' || sorter?.field === 'nome') && sorter.order) {
    params.order = `${sorter.field}:${sorter.order === 'ascend' ? 'asc' : 'desc'}`
  }

  return params
}
