import axios, { AxiosError } from 'axios'

import { getApiErrorMessage, mapListMetadataFromApi } from '@/features/taxonomia-shared/utils/apiHelpers'
import { appendRecaptchaTokenIfNeeded } from '@/features/taxonomia-shared/utils/recaptcha'

import type {
  AutorOption,
  EspecieFilters,
  EspecieListApiResponse,
  EspecieListResult,
  EspecieSorter,
  FamiliaOption,
  GeneroOption,
  ListApiResponse,
  ReinoOption
} from '../types'

function mapListResponse(data: EspecieListApiResponse): EspecieListResult {
  return {
    results: data.resultado,
    metadata: mapListMetadataFromApi(data.metadados)
  }
}

export class EspecieService {
  private static instance: EspecieService

  private constructor() {}

  public static getInstance(): EspecieService {
    if (!EspecieService.instance) {
      EspecieService.instance = new EspecieService()
    }
    return EspecieService.instance
  }

  public async list(
    values: EspecieFilters | undefined,
    pg: number,
    pageSize: number,
    sorter: EspecieSorter | undefined
  ): Promise<EspecieListResult> {
    const field = sorter?.field ?? 'especie'
    const order = sorter?.order === 'descend' ? 'desc' : 'asc'

    const params: Record<string, string | number | undefined> = {
      pagina: pg,
      limite: pageSize || 20,
      order: `${field}:${order}`,
      ...(values?.especie ? { especie: values.especie } : {}),
      ...(values?.familia ? { familia_nome: values.familia } : {}),
      ...(values?.genero ? { genero_nome: values.genero } : {})
    }

    try {
      await appendRecaptchaTokenIfNeeded(params, 'especies')
    } catch {
      throw new Error('Falha ao validar reCAPTCHA.')
    }

    try {
      const { data } = await axios.get<EspecieListApiResponse>('/especies', { params })
      return mapListResponse(data)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const ax = error as AxiosError<{ error?: { message?: string } }>
        const msg = getApiErrorMessage(ax)
        throw new Error(msg ?? ax.message ?? 'Falha ao buscar espécies.')
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
      const { data } = await axios.get<ListApiResponse<ReinoOption>>('/reinos', { params })
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
      const { data } = await axios.get<ListApiResponse<FamiliaOption>>('/familias', { params })
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

  public async listGeneros(familiaId: number | string, searchText?: string): Promise<GeneroOption[]> {
    const params: Record<string, string | number | undefined> = {
      limite: 9999999,
      familia_id: familiaId,
      ...(searchText ? { genero: searchText } : {})
    }
    try {
      await appendRecaptchaTokenIfNeeded(params, 'generos')
    } catch {
      throw new Error('Falha ao validar reCAPTCHA.')
    }
    try {
      const { data } = await axios.get<ListApiResponse<GeneroOption>>('/generos', { params })
      return data.resultado ?? []
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const ax = error as AxiosError<{ error?: { message?: string } }>
        const msg = getApiErrorMessage(ax)
        throw new Error(msg ?? ax.message ?? 'Falha ao buscar gêneros.')
      }
      throw error
    }
  }

  public async listAutores(searchText?: string): Promise<AutorOption[]> {
    const params: Record<string, string | number | undefined> = {
      limite: 9999999,
      ...(searchText ? { autor: searchText } : {})
    }
    try {
      await appendRecaptchaTokenIfNeeded(params, 'autores')
    } catch {
      throw new Error('Falha ao validar reCAPTCHA.')
    }
    try {
      const { data } = await axios.get<ListApiResponse<AutorOption>>('/autores', { params })
      return data.resultado ?? []
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const ax = error as AxiosError<{ error?: { message?: string } }>
        const msg = getApiErrorMessage(ax)
        throw new Error(msg ?? ax.message ?? 'Falha ao buscar autores.')
      }
      throw error
    }
  }

  public async create(
    nome: string,
    generoId: number | string,
    autorId: number | string | undefined
  ): Promise<void> {
    try {
      const { status } = await axios.post('/especies', {
        nome,
        genero_id: generoId,
        autor_id: autorId
      })
      if (status !== 204) {
        throw new Error('Houve um problema ao cadastrar a nova espécie, tente novamente.')
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
      throw new Error('Houve um problema ao cadastrar a nova espécie, tente novamente.')
    }
  }

  public async update(
    id: number | string,
    nome: string,
    generoId: number | string,
    autorId: number | string | null | undefined
  ): Promise<void> {
    try {
      const { status } = await axios.put(`/especies/${id}`, {
        nome,
        genero_id: generoId,
        autor_id: autorId ?? null
      })
      if (status !== 204) {
        throw new Error('Houve um problema ao atualizar a espécie, tente novamente.')
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
      throw new Error('Houve um problema ao atualizar a espécie, tente novamente.')
    }
  }
}
