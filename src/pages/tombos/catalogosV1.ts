export const CATALOGOS_V1 = {
  vegetacoes: '/v1/vegetacoes',
  relevos: '/v1/relevos',
  solos: '/v1/solos',
  fasesSucessionais: '/v1/fases-sucessionais'
} as const

export interface CatalogoV1Item {
  id: number | string
  nome: string
}

export function catalogoV1Params(nome?: string | null): Record<string, string> {
  const nomeNormalizado = (nome ?? '').trim()

  return nomeNormalizado ? { nome: nomeNormalizado } : {}
}

export function normalizaCatalogoV1(data: unknown, chave: string): CatalogoV1Item[] {
  if (Array.isArray(data)) return data as CatalogoV1Item[]

  if (data && typeof data === 'object') {
    const envelope = data as Record<string, unknown>
    const lista = envelope[chave] ?? envelope.resultado

    if (Array.isArray(lista)) return lista as CatalogoV1Item[]
  }

  return []
}

export function extraiIdCatalogoV1(valor: unknown): number | null {
  if (valor && typeof valor === 'object' && 'key' in valor) {
    return extraiIdCatalogoV1((valor as { key: unknown }).key)
  }

  if (typeof valor === 'number') return Number.isInteger(valor) ? valor : null

  if (typeof valor === 'string' && valor.trim() !== '') {
    const id = Number.parseInt(valor, 10)

    return Number.isNaN(id) ? null : id
  }

  return null
}
