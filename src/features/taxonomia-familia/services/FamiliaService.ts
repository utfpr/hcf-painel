import axios, { AxiosError } from 'axios'

import { getApiErrorMessage, mapListMetadataFromApi } from '@/features/taxonomia-shared/utils/apiHelpers'
import { appendRecaptchaTokenIfNeeded } from '@/features/taxonomia-shared/utils/recaptcha'

import type {
  FamiliaFilters,
  FamiliaListApiResponse,
  FamiliaListResult,
  FamiliaSorter,
  ReinoListApiResponse,
  ReinoOption
} from '../types'

function mapListResponse(data: FamiliaListApiResponse): FamiliaListResult {
  return {
    results: data.resultado,
    metadata: mapListMetadataFromApi(data.metadados)
  }
}

export class FamiliaService {
  private static instance: FamiliaService

  private constructor() {}

  public static getInstance(): FamiliaService {
    if (!FamiliaService.instance) {
      FamiliaService.instance = new FamiliaService()
    }
    return FamiliaService.instance
  }

  public async list(
    values: FamiliaFilters | undefined,
    pg: number,
    pageSize: number,
    sorter: FamiliaSorter | undefined
  ): Promise<FamiliaListResult> {
    const field = sorter?.field ?? 'familia'
    const order = sorter?.order === 'descend' ? 'desc' : 'asc'

    const params: Record<string, string | number | undefined> = {
      pagina: pg,
      limite: pageSize || 20,
      order: `${field}:${order}`,
      ...(values?.familia ? { familia: values.familia } : {})
    }

    try {
      await appendRecaptchaTokenIfNeeded(params, 'familias')
    } catch {
      throw new Error('Falha ao validar reCAPTCHA.')
    }

    try {
      const { data } = await axios.get<FamiliaListApiResponse>('/familias', { params })
      return mapListResponse(data)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const ax = error as AxiosError<{ error?: { message?: string } }>
        const msg = getApiErrorMessage(ax)
        throw new Error(msg ?? ax.message ?? 'Falha ao buscar famílias.')
      }
      throw error
    }
  }

  public async listReinos(searchText?: string): Promise<ReinoOption[]> {
    const params: Record<string, string | number | undefined> = {
      limite: 9999999,
      ...(searchText ? { reino: searchText } : {})
    }

    try {
      await appendRecaptchaTokenIfNeeded(params, 'reinos')
    } catch {
      throw new Error('Falha ao validar reCAPTCHA.')
    }

    try {
      const { data } = await axios.get<ReinoListApiResponse>('/reinos', { params })
      return data.resultado ?? []
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const ax = error as AxiosError<{ error?: { message?: string } }>
        const msg = getApiErrorMessage(ax)
        throw new Error(msg ?? ax.message ?? 'Falha ao buscar reinos.')
      }
      throw error
    }
  }

  public async create(nome: string, reinoId: number | string): Promise<void> {
    try {
      const { status } = await axios.post('/familias', { nome, reinoId })
      if (status !== 204) {
        throw new Error('Houve um problema ao cadastrar a nova família, tente novamente.')
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const ax = error as AxiosError<{ error?: { message?: string } }>
        const msg = getApiErrorMessage(ax)
        if (msg) {
          throw new Error(msg)
        }
        if (ax.response?.status === 409) {
          throw new Error('Família já cadastrada.')
        }
      }
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Houve um problema ao cadastrar a nova família, tente novamente.')
    }
  }

  public async update(id: number | string, nome: string): Promise<void> {
    try {
      const { status } = await axios.put(`/familias/${id}`, { nome })
      if (status !== 204) {
        throw new Error('Houve um problema ao atualizar a família, tente novamente.')
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
      throw new Error('Houve um problema ao atualizar a família, tente novamente.')
    }
  }
}
