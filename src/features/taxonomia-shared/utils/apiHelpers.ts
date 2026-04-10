import type { AxiosError } from 'axios'

export function getApiErrorMessage(
  error: AxiosError<{ error?: { message?: string } }>
): string | undefined {
  return error.response?.data?.error?.message
}

export function mapListMetadataFromApi(m: { total: number; pagina: number; limite: number }): {
  total: number
  page: number
  limit: number
} {
  return {
    total: m.total,
    page: m.pagina,
    limit: m.limite
  }
}
