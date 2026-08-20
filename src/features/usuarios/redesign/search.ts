export function inferSearchField(query: string): 'nome' | 'email' | 'telefone' | undefined {
  const trimmed = query.trim()
  if (!trimmed) return undefined
  if (trimmed.includes('@')) return 'email'
  const digits = trimmed.replace(/\D/g, '')
  if (digits.length >= 8 && /^[\d+\s().-]+$/.test(trimmed)) return 'telefone'
  return 'nome'
}

export function toSearchFilters(query: string): {
  nome?: string
  email?: string
  telefone?: string
} {
  const field = inferSearchField(query)
  const trimmed = query.trim()
  if (!field) return {}
  return { [field]: trimmed }
}
