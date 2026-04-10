import axios, { AxiosError } from 'axios'

import { getApiErrorMessage, mapListMetadataFromApi } from '@/features/taxonomia-shared/utils/apiHelpers'
import { appendRecaptchaTokenIfNeeded } from '@/features/taxonomia-shared/utils/recaptcha'

import type {
  FamiliaListApiResponse,
  FamiliaOption,
  GeneroFilters,
  GeneroListApiResponse,
  GeneroListResult,
  GeneroSorter,
  ReinoListApiResponse,
  ReinoOption
} from '../types'

function mapListResponse(data: GeneroListApiResponse): GeneroListResult {
  return {
    results: data.resultado,
    metadata: mapListMetadataFromApi(data.metadados)
  }
}

export class GeneroService {
  private static instance: GeneroService

  private constructor() {}

  public static getInstance(): GeneroService {
    if (!GeneroService.instance) {
      GeneroService.instance = new GeneroService()
    }
    return GeneroService.instance
  }

  public async list(
    values: GeneroFilters | undefined,
    pg: number,
    pageSize: number,
    sorter: GeneroSorter | undefined
  ): Promise<GeneroListResult> {
    const field = sorter?.field ?? 'genero'
    const order = sorter?.order === 'descend' ? 'desc' : 'asc'

    const params: Record<string, string | number | undefined> = {
      pagina: pg,
      limite: pageSize || 20,
      order: `${field}:${order}`,
      ...(values?.genero ? { genero: values.genero } : {}),
      ...(values?.familia ? { familia_nome: values.familia } : {})
    }

    try {
      await appendRecaptchaTokenIfNeeded(params, 'generos')
    } catch {
      throw new Error('Falha ao validar reCAPTCHA.')
    }

    try {
      const { data } = await axios.get<GeneroListApiResponse>('/generos', { params })
      return mapListResponse(data)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const ax = error as AxiosError<{ error?: { message?: string } }>
        const msg = getApiErrorMessage(ax)
        throw new Error(msg ?? ax.message ?? 'Falha ao buscar gêneros.')
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

  public async listFamilias(reinoId: number | string, searchText?: string): Promise<FamiliaOption[]> {
    const params: Record<string, string | number | undefined> = {
      limite: 9999999,
      reino_id: reinoId,
      ...(searchText ? { familia: searchText } : {})
    }

    try {
      await appendRecaptchaTokenIfNeeded(params, 'familias')
    } catch {
      throw new Error('Falha ao validar reCAPTCHA.')
    }

    try {
      const { data } = await axios.get<FamiliaListApiResponse>('/familias', { params })
      return data.resultado ?? []
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const ax = error as AxiosError<{ error?: { message?: string } }>
        const msg = getApiErrorMessage(ax)
        throw new Error(msg ?? ax.message ?? 'Falha ao buscar famílias.')
      }
      throw error
    }
  }

  public async create(nome: string, familiaId: number | string): Promise<void> {
    try {
      const { status } = await axios.post('/generos', { nome, familia_id: familiaId })
      if (status !== 204) {
        throw new Error('Houve um problema ao cadastrar o novo gênero, tente novamente.')
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
      throw new Error('Houve um problema ao cadastrar o novo gênero, tente novamente.')
    }
  }

  public async update(id: number | string, nome: string, familiaId: number | string): Promise<void> {
    try {
      const { status } = await axios.put(`/generos/${id}`, { nome, familia_id: familiaId })
      if (status !== 204) {
        throw new Error('Houve um problema ao atualizar o gênero, tente novamente.')
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
      throw new Error('Houve um problema ao atualizar o gênero, tente novamente.')
    }
  }
}
