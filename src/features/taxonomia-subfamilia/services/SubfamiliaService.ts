import axios, { AxiosError } from 'axios'

import { getApiErrorMessage, mapListMetadataFromApi } from '@/features/taxonomia-shared/utils/apiHelpers'
import { appendRecaptchaTokenIfNeeded } from '@/features/taxonomia-shared/utils/recaptcha'

import type {
  FamiliaListApiResponse,
  FamiliaOption,
  ReinoListApiResponse,
  ReinoOption,
  SubfamiliaFilters,
  SubfamiliaListApiResponse,
  SubfamiliaListResult,
  SubfamiliaSorter
} from '../types'

function mapListResponse(data: SubfamiliaListApiResponse): SubfamiliaListResult {
  return {
    results: data.resultado,
    metadata: mapListMetadataFromApi(data.metadados)
  }
}

export class SubfamiliaService {
  private static instance: SubfamiliaService

  private constructor() {}

  public static getInstance(): SubfamiliaService {
    if (!SubfamiliaService.instance) {
      SubfamiliaService.instance = new SubfamiliaService()
    }
    return SubfamiliaService.instance
  }

  public async list(
    values: SubfamiliaFilters | undefined,
    pg: number,
    pageSize: number,
    sorter: SubfamiliaSorter | undefined
  ): Promise<SubfamiliaListResult> {
    const field = sorter?.field ?? 'subfamilia'
    const order = sorter?.order === 'descend' ? 'desc' : 'asc'

    const params: Record<string, string | number | undefined> = {
      pagina: pg,
      limite: pageSize || 20,
      order: `${field}:${order}`,
      ...(values?.subfamilia ? { subfamilia: values.subfamilia } : {}),
      ...(values?.familia ? { familia_nome: values.familia } : {})
    }

    try {
      await appendRecaptchaTokenIfNeeded(params, 'generos')
    } catch {
      throw new Error('Falha ao validar reCAPTCHA.')
    }

    try {
      const { data } = await axios.get<SubfamiliaListApiResponse>('/subfamilias', { params })
      return mapListResponse(data)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const ax = error as AxiosError<{ error?: { message?: string } }>
        const msg = getApiErrorMessage(ax)
        throw new Error(msg ?? ax.message ?? 'Falha ao buscar subfamílias.')
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
      await appendRecaptchaTokenIfNeeded(params, 'generos')
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
      await appendRecaptchaTokenIfNeeded(params, 'generos')
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
      const { status } = await axios.post('/subfamilias', { nome, familia_id: familiaId })
      if (status !== 204) {
        throw new Error('Houve um problema ao cadastrar a nova subfamília, tente novamente.')
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
      throw new Error('Houve um problema ao cadastrar a nova subfamília, tente novamente.')
    }
  }

  public async update(id: number | string, nome: string, familiaId: number | string): Promise<void> {
    try {
      const { status } = await axios.put(`/subfamilias/${id}`, { nome, familia_id: familiaId })
      if (status !== 204) {
        throw new Error('Houve um problema ao atualizar a subfamília, tente novamente.')
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
      throw new Error('Houve um problema ao atualizar a subfamília, tente novamente.')
    }
  }
}
