import axios, { AxiosError } from 'axios'

import { getApiErrorMessage, mapListMetadataFromApi } from '@/features/taxonomia-shared/utils/apiHelpers'
import { appendRecaptchaTokenIfNeeded } from '@/features/taxonomia-shared/utils/recaptcha'

import type {
  AutorFilters, AutorListApiResponse, AutorListResult, AutorSorter
} from '../types'

function mapListResponse(data: AutorListApiResponse): AutorListResult {
  return {
    results: data.resultado,
    metadata: mapListMetadataFromApi(data.metadados)
  }
}

export class AutorService {
  private static instance: AutorService

  private constructor() {}

  public static getInstance(): AutorService {
    if (!AutorService.instance) {
      AutorService.instance = new AutorService()
    }
    return AutorService.instance
  }

  public async list(
    values: AutorFilters | undefined,
    pg: number,
    pageSize: number,
    sorter: AutorSorter | undefined
  ): Promise<AutorListResult> {
    const field = sorter?.field ?? 'autor'
    const order = sorter?.order === 'descend' ? 'desc' : 'asc'

    const params: Record<string, string | number | undefined> = {
      pagina: pg,
      limite: pageSize || 20,
      order: `${field}:${order}`,
      ...(values?.autor ? { autor: values.autor } : {})
    }

    try {
      await appendRecaptchaTokenIfNeeded(params, 'generos')
    } catch {
      throw new Error('Falha ao validar reCAPTCHA.')
    }

    try {
      const { data } = await axios.get<AutorListApiResponse>('/autores', { params })
      return mapListResponse(data)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const ax = error as AxiosError<{ error?: { message?: string } }>
        const msg = getApiErrorMessage(ax)
        throw new Error(msg ?? ax.message ?? 'Falha ao buscar autores.')
      }
      throw error
    }
  }

  public async create(nome: string, observacao: string): Promise<void> {
    try {
      const { status } = await axios.post('/autores', { nome, observacao })
      if (status !== 204) {
        throw new Error('Houve um problema ao cadastrar o novo autor, tente novamente.')
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
      throw new Error('Houve um problema ao cadastrar o novo autor, tente novamente.')
    }
  }

  /** API espera `iniciais` no PUT (compatível com lista legada). */
  public async update(id: number | string, nome: string, observacao: string): Promise<void> {
    try {
      const { status } = await axios.put(`/autores/${id}`, {
        nome,
        iniciais: observacao
      })
      if (status !== 204) {
        throw new Error('Houve um problema ao atualizar o autor, tente novamente.')
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
      throw new Error('Houve um problema ao atualizar o autor, tente novamente.')
    }
  }
}
