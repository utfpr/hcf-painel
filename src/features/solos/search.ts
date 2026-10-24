export interface SolosSorter {
  field?: string
  order?: 'ascend' | 'descend' | null
}

export function solosListParams(
  nome: string,
  pagina: number,
  limite: number,
  sorter?: SolosSorter
): Record<string, string | number> {
  const params: Record<string, string | number> = { pagina, limite }
  const normalizedName = nome.trim()

  if (normalizedName) params.nome = normalizedName

  if ((sorter?.field === 'id' || sorter?.field === 'nome') && sorter.order) {
    params.order = `${sorter.field}:${sorter.order === 'ascend' ? 'asc' : 'desc'}`
  }

  return params
}
