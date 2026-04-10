import { useMemo } from 'react'

import { useForm } from 'react-hook-form'
import type { RouteComponentProps } from 'react-router-dom'

import { useTaxonomiaListCore } from '@/features/taxonomia-shared/hooks/useTaxonomiaListCore'

import { GeneroService } from '../services/GeneroService'
import type {
  Genero,
  GeneroFilters,
  GeneroMetadata,
  GeneroSearchFormValues,
  GeneroSorter
} from '../types'

const COOKIE_FILTERS = 'genero_filters'
const COOKIE_SORTER = 'genero_sorter'

function parseGeneroListSearch(search: string): {
  filters: GeneroFilters
  sorter: GeneroSorter | undefined
} {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  const genero = params.get('genero')?.trim()
  const familia = params.get('familia')?.trim()
  const filters: GeneroFilters = {}
  if (genero) filters.genero = genero
  if (familia) filters.familia = familia
  const sortField = params.get('sortField')?.trim()
  const sortOrderRaw = params.get('sortOrder')
  const sortOrder
    = sortOrderRaw === 'ascend' || sortOrderRaw === 'descend' ? sortOrderRaw : undefined
  let sorter: GeneroSorter | undefined
  if (sortField && sortOrder) {
    sorter = { field: sortField, order: sortOrder }
  } else {
    sorter = undefined
  }
  return { filters, sorter }
}

function hasRelevantUrlParams(search: string): boolean {
  const { filters, sorter } = parseGeneroListSearch(search)
  return Boolean(filters.genero || filters.familia) || Boolean(sorter?.field && sorter?.order)
}

function buildGeneroListSearch(filters: GeneroFilters, sorter: GeneroSorter | undefined): string {
  const p = new URLSearchParams()
  const genero = filters.genero?.trim()
  const familia = filters.familia?.trim()
  if (genero) {
    p.set('genero', genero)
  }
  if (familia) {
    p.set('familia', familia)
  }
  if (sorter?.field && sorter?.order) {
    p.set('sortField', sorter.field)
    p.set('sortOrder', sorter.order)
  }
  const s = p.toString()
  return s ? `?${s}` : ''
}

function toFilters(values: GeneroSearchFormValues): GeneroFilters {
  const genero = values.genero?.trim()
  const familia = values.familia?.trim()
  const f: GeneroFilters = {}
  if (genero) f.genero = genero
  if (familia) f.familia = familia
  return f
}

function toFormDefaultValues(f: GeneroFilters): GeneroSearchFormValues {
  return {
    genero: f.genero ?? '',
    familia: f.familia ?? ''
  }
}

export interface UseGeneroListViewModelOptions {
  history: RouteComponentProps['history']
  location: RouteComponentProps['location']
}

export interface GeneroListViewModel {
  generos: Genero[]
  metadata: Partial<GeneroMetadata>
  loading: boolean
  page: number
  pageSize: number
  filters: GeneroFilters
  lastSorter: GeneroSorter | undefined
  searchForm: ReturnType<typeof useForm<GeneroSearchFormValues>>
  refresh: () => Promise<void>
  handleSearch: (values: GeneroSearchFormValues) => Promise<void>
  handleClear: () => Promise<void>
  handleTableChange: (
    nextPage: number,
    nextPageSize: number,
    sorter: GeneroSorter | undefined,
    sortChanged: boolean
  ) => Promise<void>
}

export function useGeneroListViewModel({
  history,
  location
}: UseGeneroListViewModelOptions): GeneroListViewModel {
  const service = useMemo(() => GeneroService.getInstance(), [])

  const core = useTaxonomiaListCore<GeneroFilters, GeneroSearchFormValues, GeneroSorter, Genero>({
    history,
    location,
    cookieFiltersKey: COOKIE_FILTERS,
    cookieSorterKey: COOKIE_SORTER,
    parseSearch: parseGeneroListSearch,
    hasRelevantUrlParams,
    buildSearch: buildGeneroListSearch,
    fetchFn: (filters, pg, ps, sorter) => service.list(filters, pg, ps, sorter),
    emptyFilters: {},
    emptyFormValues: { genero: '', familia: '' },
    toFilters,
    toFormDefaultValues,
    entityLabel: 'gêneros'
  })

  return {
    generos: core.items,
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
