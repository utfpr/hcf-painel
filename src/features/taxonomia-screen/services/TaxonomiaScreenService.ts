import axios, { AxiosError } from 'axios'

import { getApiErrorMessage, mapListMetadataFromApi } from '@/features/taxonomia-shared/utils/apiHelpers'

import type {
  TaxonomiaFilters,
  TaxonomiaListApiResponse,
  TaxonomiaListResult
} from '../types'

function mapListResponse(data: TaxonomiaListApiResponse): TaxonomiaListResult {
  return {
    results: data.resultado,
    metadata: mapListMetadataFromApi(data.metadados)
  }
}

export class TaxonomiaScreenService {
  private static instance: TaxonomiaScreenService

  private constructor() {}

  public static getInstance(): TaxonomiaScreenService {
    if (!TaxonomiaScreenService.instance) {
      TaxonomiaScreenService.instance = new TaxonomiaScreenService()
    }
    return TaxonomiaScreenService.instance
  }

  public async list(
    values: TaxonomiaFilters | undefined,
    pg: number,
    pageSize: number
  ): Promise<TaxonomiaListResult> {
    const params: Record<string, string | number | undefined> = {
      pagina: pg,
      limite: pageSize || 20
    }

    if (values?.familia) params.familia = values.familia
    if (values?.subfamilia) params.subfamilia = values.subfamilia
    if (values?.genero) params.genero = values.genero
    if (values?.especie) params.especie = values.especie
    if (values?.subespecie) params.subespecie = values.subespecie
    if (values?.variedade) params.variedade = values.variedade

    try {
      const { data } = await axios.get<TaxonomiaListApiResponse>('/taxonomias', { params })
      return mapListResponse(data)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const ax = error as AxiosError<{ error?: { message?: string } }>
        const msg = getApiErrorMessage(ax)
        throw new Error(msg ?? ax.message ?? 'Falha ao buscar taxonomias.')
      }
      throw error
    }
  }
}
