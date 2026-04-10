import axios, { AxiosError } from 'axios'

import { getApiErrorMessage, mapListMetadataFromApi } from '@/features/taxonomia-shared/utils/apiHelpers'
import { appendRecaptchaTokenIfNeeded } from '@/features/taxonomia-shared/utils/recaptcha'

import type {
  ReinoFilters, ReinoListApiResponse, ReinoListResult, ReinoSorter
} from '../types'

function mapListResponse(data: ReinoListApiResponse): ReinoListResult {
  return {
    results: data.resultado,
    metadata: mapListMetadataFromApi(data.metadados)
  }
}

export class ReinoService {
  private static instance: ReinoService

  private constructor() {}

  public static getInstance(): ReinoService {
    if (!ReinoService.instance) {
      ReinoService.instance = new ReinoService()
    }
    return ReinoService.instance
  }

  public async list(
    values: ReinoFilters | undefined,
    pg: number,
    pageSize: number,
    sorter: ReinoSorter | undefined
  ): Promise<ReinoListResult> {
    const field = sorter?.field ?? 'reino'
    const order = sorter?.order === 'descend' ? 'desc' : 'asc'

    const params: Record<string, string | number | undefined> = {
      pagina: pg,
      limite: pageSize || 20,
      order: `${field}:${order}`,
      ...(values?.reino ? { reino: values.reino } : {})
    }

    try {
      await appendRecaptchaTokenIfNeeded(params, 'reinos')
    } catch {
      throw new Error('Falha ao validar reCAPTCHA.')
    }

    try {
      const { data } = await axios.get<ReinoListApiResponse>('/reinos', { params })
      return mapListResponse(data)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const ax = error as AxiosError<{ error?: { message?: string } }>
        const msg = getApiErrorMessage(ax)
        throw new Error(msg ?? ax.message ?? 'Falha ao buscar reinos.')
      }
      throw error
    }
  }

  public async create(name: string): Promise<void> {
    try {
      const { status } = await axios.post('/reinos', { nome: name })
      if (status !== 204) {
        throw new Error('Houve um problema ao cadastrar o novo reino, tente novamente.')
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const ax = error as AxiosError<{ error?: { message?: string } }>
        const msg = getApiErrorMessage(ax)
        if (msg) {
          throw new Error(msg)
        }
        if (ax.response?.status === 409) {
          throw new Error('Reino já cadastrado.')
        }
      }
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Houve um problema ao cadastrar o novo reino, tente novamente.')
    }
  }

  public async update(id: number | string, name: string): Promise<void> {
    try {
      const { status } = await axios.put(`/reinos/${id}`, { nome: name })
      if (status !== 204) {
        throw new Error('Houve um problema ao atualizar o reino, tente novamente.')
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const ax = error as AxiosError<{ error?: { message?: string } }>
        const msg = getApiErrorMessage(ax)
        if (msg) {
          throw new Error(msg)
        }
      }
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Houve um problema ao atualizar o reino, tente novamente.')
    }
  }
}
