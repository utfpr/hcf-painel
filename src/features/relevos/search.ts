export interface RelevosSorter {
  field?: string
  order?: 'ascend' | 'descend' | null
}

export function relevosListParams(
  nome: string,
  pagina: number,
  limite: number,
  sorter?: RelevosSorter
): Record<string, string | number> {
  const params: Record<string, string | number> = { pagina, limite }
  const normalizedName = nome.trim()

  if (normalizedName) params.nome = normalizedName

  if ((sorter?.field === 'id' || sorter?.field === 'nome') && sorter.order) {
    params.order = `${sorter.field}:${sorter.order === 'ascend' ? 'asc' : 'desc'}`
  }

  return params
}
