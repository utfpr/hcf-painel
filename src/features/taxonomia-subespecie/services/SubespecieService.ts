import axios, { AxiosError } from 'axios'

import { getApiErrorMessage, mapListMetadataFromApi } from '@/features/taxonomia-shared/utils/apiHelpers'
import { appendRecaptchaTokenIfNeeded } from '@/features/taxonomia-shared/utils/recaptcha'

import type {
  AutorOption,
  EspecieOption,
  FamiliaOption,
  GeneroOption,
  ListApiResponse,
  ReinoOption,
  SubespecieFilters,
  SubespecieListApiResponse,
  SubespecieListResult,
  SubespecieSorter
} from '../types'

function mapListResponse(data: SubespecieListApiResponse): SubespecieListResult {
  return {
    results: data.resultado,
    metadata: mapListMetadataFromApi(data.metadados)
  }
}

export class SubespecieService {
  private static instance: SubespecieService

  private constructor() {}

  public static getInstance(): SubespecieService {
    if (!SubespecieService.instance) {
      SubespecieService.instance = new SubespecieService()
    }
    return SubespecieService.instance
  }

  public async list(
    values: SubespecieFilters | undefined,
    pg: number,
    pageSize: number,
    sorter: SubespecieSorter | undefined
  ): Promise<SubespecieListResult> {
    const field = sorter?.field ?? 'subespecie'
    const order = sorter?.order === 'descend' ? 'desc' : 'asc'

    const params: Record<string, string | number | undefined> = {
      pagina: pg,
      limite: pageSize || 20,
      order: `${field}:${order}`,
      ...(values?.subespecie ? { subespecie: values.subespecie } : {}),
      ...(values?.familia ? { familia_nome: values.familia } : {}),
      ...(values?.genero ? { genero_nome: values.genero } : {}),
      ...(values?.especie ? { especie_nome: values.especie } : {})
    }

    try {
      await appendRecaptchaTokenIfNeeded(params, 'subespecies')
    } catch {
      throw new Error('Falha ao validar reCAPTCHA.')
    }

    try {
      const { data } = await axios.get<SubespecieListApiResponse>('/subespecies', { params })
      return mapListResponse(data)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const ax = error as AxiosError<{ error?: { message?: string } }>
        const msg = getApiErrorMessage(ax)
        throw new Error(msg ?? ax.message ?? 'Falha ao buscar subespécies.')
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

  public async listEspecies(generoId: number | string, searchText?: string): Promise<EspecieOption[]> {
    const params: Record<string, string | number | undefined> = {
      limite: 9999999,
      genero_id: generoId,
      ...(searchText ? { especie: searchText } : {})
    }
    try {
      await appendRecaptchaTokenIfNeeded(params, 'especies')
    } catch {
      throw new Error('Falha ao validar reCAPTCHA.')
    }
    try {
      const { data } = await axios.get<ListApiResponse<EspecieOption>>('/especies', { params })
      return data.resultado ?? []
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const ax = error as AxiosError<{ error?: { message?: string } }>
        const msg = getApiErrorMessage(ax)
        throw new Error(msg ?? ax.message ?? 'Falha ao buscar espécies.')
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
    especieId: number | string,
    autorId: number | string | undefined
  ): Promise<void> {
    try {
      const { status } = await axios.post('/subespecies', {
        nome,
        especie_id: especieId,
        autor_id: autorId
      })
      if (status !== 204) {
        throw new Error('Houve um problema ao cadastrar a nova subespécie, tente novamente.')
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
      throw new Error('Houve um problema ao cadastrar a nova subespécie, tente novamente.')
    }
  }

  public async update(
    id: number | string,
    nome: string,
    especieId: number | string,
    autorId: number | string | null | undefined
  ): Promise<void> {
    try {
      const { status } = await axios.put(`/subespecies/${id}`, {
        nome,
        especie_id: especieId,
        autor_id: autorId ?? null
      })
      if (status !== 204) {
        throw new Error('Houve um problema ao atualizar a subespécie, tente novamente.')
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
      throw new Error('Houve um problema ao atualizar a subespécie, tente novamente.')
    }
  }
}
