import { useMemo } from 'react'

import { useForm } from 'react-hook-form'
import type { RouteComponentProps } from 'react-router-dom'

import { useTaxonomiaListCore } from '@/features/taxonomia-shared/hooks/useTaxonomiaListCore'

import { SubespecieService } from '../services/SubespecieService'
import type {
  Subespecie,
  SubespecieFilters,
  SubespecieMetadata,
  SubespecieSearchFormValues,
  SubespecieSorter
} from '../types'

const COOKIE_FILTERS = 'subespecie_filters'
const COOKIE_SORTER = 'subespecie_sorter'

function parseSubespecieListSearch(search: string): {
  filters: SubespecieFilters
  sorter: SubespecieSorter | undefined
} {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  const filters: SubespecieFilters = {}
  const subespecie = params.get('subespecie')?.trim()
  const familia = params.get('familia')?.trim()
  const genero = params.get('genero')?.trim()
  const especie = params.get('especie')?.trim()
  if (subespecie) filters.subespecie = subespecie
  if (familia) filters.familia = familia
  if (genero) filters.genero = genero
  if (especie) filters.especie = especie
  const sortField = params.get('sortField')?.trim()
  const sortOrderRaw = params.get('sortOrder')
  const sortOrder
    = sortOrderRaw === 'ascend' || sortOrderRaw === 'descend' ? sortOrderRaw : undefined
  let sorter: SubespecieSorter | undefined
  if (sortField && sortOrder) {
    sorter = { field: sortField, order: sortOrder }
  } else {
    sorter = undefined
  }
  return { filters, sorter }
}

function hasRelevantUrlParams(search: string): boolean {
  const { filters, sorter } = parseSubespecieListSearch(search)
  return Boolean(
    filters.subespecie || filters.familia || filters.genero || filters.especie
  ) || Boolean(sorter?.field && sorter?.order)
}

function buildSubespecieListSearch(filters: SubespecieFilters, sorter: SubespecieSorter | undefined): string {
  const p = new URLSearchParams()
  if (filters.subespecie?.trim()) p.set('subespecie', filters.subespecie.trim())
  if (filters.familia?.trim()) p.set('familia', filters.familia.trim())
  if (filters.genero?.trim()) p.set('genero', filters.genero.trim())
  if (filters.especie?.trim()) p.set('especie', filters.especie.trim())
  if (sorter?.field && sorter?.order) {
    p.set('sortField', sorter.field)
    p.set('sortOrder', sorter.order)
  }
  const s = p.toString()
  return s ? `?${s}` : ''
}

function toFilters(values: SubespecieSearchFormValues): SubespecieFilters {
  const f: SubespecieFilters = {}
  if (values.subespecie?.trim()) f.subespecie = values.subespecie.trim()
  if (values.familia?.trim()) f.familia = values.familia.trim()
  if (values.genero?.trim()) f.genero = values.genero.trim()
  if (values.especie?.trim()) f.especie = values.especie.trim()
  return f
}

function toFormDefaultValues(f: SubespecieFilters): SubespecieSearchFormValues {
  return {
    subespecie: f.subespecie ?? '',
    familia: f.familia ?? '',
    genero: f.genero ?? '',
    especie: f.especie ?? ''
  }
}

export interface UseSubespecieListViewModelOptions {
  history: RouteComponentProps['history']
  location: RouteComponentProps['location']
}

export interface SubespecieListViewModel {
  subespecies: Subespecie[]
  metadata: Partial<SubespecieMetadata>
  loading: boolean
  page: number
  pageSize: number
  filters: SubespecieFilters
  lastSorter: SubespecieSorter | undefined
  searchForm: ReturnType<typeof useForm<SubespecieSearchFormValues>>
  refresh: () => Promise<void>
  handleSearch: (values: SubespecieSearchFormValues) => Promise<void>
  handleClear: () => Promise<void>
  handleTableChange: (
    nextPage: number,
    nextPageSize: number,
    sorter: SubespecieSorter | undefined,
    sortChanged: boolean
  ) => Promise<void>
}

export function useSubespecieListViewModel({
  history,
  location
}: UseSubespecieListViewModelOptions): SubespecieListViewModel {
  const service = useMemo(() => SubespecieService.getInstance(), [])

  const core = useTaxonomiaListCore<
    SubespecieFilters,
    SubespecieSearchFormValues,
    SubespecieSorter,
    Subespecie
  >({
    history,
    location,
    cookieFiltersKey: COOKIE_FILTERS,
    cookieSorterKey: COOKIE_SORTER,
    parseSearch: parseSubespecieListSearch,
    hasRelevantUrlParams,
    buildSearch: buildSubespecieListSearch,
    fetchFn: (filters, pg, ps, sorter) => service.list(filters, pg, ps, sorter),
    emptyFilters: {},
    emptyFormValues: {
      subespecie: '', familia: '', genero: '', especie: ''
    },
    toFilters,
    toFormDefaultValues,
    entityLabel: 'subespécies'
  })

  return {
    subespecies: core.items,
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
