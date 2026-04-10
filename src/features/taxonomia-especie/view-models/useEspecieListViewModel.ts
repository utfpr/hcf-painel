import { useMemo } from 'react'

import { useForm } from 'react-hook-form'
import type { RouteComponentProps } from 'react-router-dom'

import { useTaxonomiaListCore } from '@/features/taxonomia-shared/hooks/useTaxonomiaListCore'

import { EspecieService } from '../services/EspecieService'
import type {
  Especie,
  EspecieFilters,
  EspecieMetadata,
  EspecieSearchFormValues,
  EspecieSorter
} from '../types'

const COOKIE_FILTERS = 'especie_filters'
const COOKIE_SORTER = 'especie_sorter'

function parseEspecieListSearch(search: string): {
  filters: EspecieFilters
  sorter: EspecieSorter | undefined
} {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  const especie = params.get('especie')?.trim()
  const familia = params.get('familia')?.trim()
  const genero = params.get('genero')?.trim()
  const filters: EspecieFilters = {}
  if (especie) filters.especie = especie
  if (familia) filters.familia = familia
  if (genero) filters.genero = genero
  const sortField = params.get('sortField')?.trim()
  const sortOrderRaw = params.get('sortOrder')
  const sortOrder
    = sortOrderRaw === 'ascend' || sortOrderRaw === 'descend' ? sortOrderRaw : undefined
  let sorter: EspecieSorter | undefined
  if (sortField && sortOrder) {
    sorter = { field: sortField, order: sortOrder }
  } else {
    sorter = undefined
  }
  return { filters, sorter }
}

function hasRelevantUrlParams(search: string): boolean {
  const { filters, sorter } = parseEspecieListSearch(search)
  return Boolean(filters.especie || filters.familia || filters.genero)
      || Boolean(sorter?.field && sorter?.order)
}

function buildEspecieListSearch(filters: EspecieFilters, sorter: EspecieSorter | undefined): string {
  const p = new URLSearchParams()
  if (filters.especie?.trim()) p.set('especie', filters.especie.trim())
  if (filters.familia?.trim()) p.set('familia', filters.familia.trim())
  if (filters.genero?.trim()) p.set('genero', filters.genero.trim())
  if (sorter?.field && sorter?.order) {
    p.set('sortField', sorter.field)
    p.set('sortOrder', sorter.order)
  }
  const s = p.toString()
  return s ? `?${s}` : ''
}

function toFilters(values: EspecieSearchFormValues): EspecieFilters {
  const f: EspecieFilters = {}
  const e = values.especie?.trim()
  const fam = values.familia?.trim()
  const g = values.genero?.trim()
  if (e) f.especie = e
  if (fam) f.familia = fam
  if (g) f.genero = g
  return f
}

function toFormDefaultValues(f: EspecieFilters): EspecieSearchFormValues {
  return {
    especie: f.especie ?? '',
    familia: f.familia ?? '',
    genero: f.genero ?? ''
  }
}

export interface UseEspecieListViewModelOptions {
  history: RouteComponentProps['history']
  location: RouteComponentProps['location']
}

export interface EspecieListViewModel {
  especies: Especie[]
  metadata: Partial<EspecieMetadata>
  loading: boolean
  page: number
  pageSize: number
  filters: EspecieFilters
  lastSorter: EspecieSorter | undefined
  searchForm: ReturnType<typeof useForm<EspecieSearchFormValues>>
  refresh: () => Promise<void>
  handleSearch: (values: EspecieSearchFormValues) => Promise<void>
  handleClear: () => Promise<void>
  handleTableChange: (
    nextPage: number,
    nextPageSize: number,
    sorter: EspecieSorter | undefined,
    sortChanged: boolean
  ) => Promise<void>
}

export function useEspecieListViewModel({
  history,
  location
}: UseEspecieListViewModelOptions): EspecieListViewModel {
  const service = useMemo(() => EspecieService.getInstance(), [])

  const core = useTaxonomiaListCore<EspecieFilters, EspecieSearchFormValues, EspecieSorter, Especie>({
    history,
    location,
    cookieFiltersKey: COOKIE_FILTERS,
    cookieSorterKey: COOKIE_SORTER,
    parseSearch: parseEspecieListSearch,
    hasRelevantUrlParams,
    buildSearch: buildEspecieListSearch,
    fetchFn: (filters, pg, ps, sorter) => service.list(filters, pg, ps, sorter),
    emptyFilters: {},
    emptyFormValues: {
      especie: '', familia: '', genero: ''
    },
    toFilters,
    toFormDefaultValues,
    entityLabel: 'espécies'
  })

  return {
    especies: core.items,
    metadata: core.metadata,
    loading: core.loading,
    page: core.page,
    pageSize: core.pageSize,
    filters: core.filters,
    lastSorter: core.lastSorter,
    searchForm: core.searchForm,
    refresh: core.refresh,
    handleSearch: core.handleSearch,
    handleClear: core.handleClear,
    handleTableChange: core.handleTableChange
  }
}
