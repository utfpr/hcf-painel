import { useMemo } from 'react'

import { useForm } from 'react-hook-form'
import type { RouteComponentProps } from 'react-router-dom'

import { useTaxonomiaListCore } from '@/features/taxonomia-shared/hooks/useTaxonomiaListCore'

import { AutorService } from '../services/AutorService'
import type {
  Autor,
  AutorFilters,
  AutorMetadata,
  AutorSearchFormValues,
  AutorSorter
} from '../types'

const COOKIE_FILTERS = 'autor_filters'
const COOKIE_SORTER = 'autor_sorter'

function parseAutorListSearch(search: string): {
  filters: AutorFilters
  sorter: AutorSorter | undefined
} {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  const autor = params.get('autor')?.trim()
  const filters: AutorFilters = autor ? { autor } : {}
  const sortField = params.get('sortField')?.trim()
  const sortOrderRaw = params.get('sortOrder')
  const sortOrder
    = sortOrderRaw === 'ascend' || sortOrderRaw === 'descend' ? sortOrderRaw : undefined
  let sorter: AutorSorter | undefined
  if (sortField && sortOrder) {
    sorter = { field: sortField, order: sortOrder }
  } else {
    sorter = undefined
  }
  return { filters, sorter }
}

function hasRelevantUrlParams(search: string): boolean {
  const { filters, sorter } = parseAutorListSearch(search)
  return Boolean(filters.autor) || Boolean(sorter?.field && sorter?.order)
}

function buildAutorListSearch(filters: AutorFilters, sorter: AutorSorter | undefined): string {
  const p = new URLSearchParams()
  const autor = filters.autor?.trim()
  if (autor) {
    p.set('autor', autor)
  }
  if (sorter?.field && sorter?.order) {
    p.set('sortField', sorter.field)
    p.set('sortOrder', sorter.order)
  }
  const s = p.toString()
  return s ? `?${s}` : ''
}

function toFilters(values: AutorSearchFormValues): AutorFilters {
  const trimmed = values.autor?.trim()
  return trimmed ? { autor: trimmed } : {}
}

function toFormDefaultValues(f: AutorFilters): AutorSearchFormValues {
  return { autor: f.autor ?? '' }
}

export interface UseAutorListViewModelOptions {
  history: RouteComponentProps['history']
  location: RouteComponentProps['location']
}

export interface AutorListViewModel {
  autores: Autor[]
  metadata: Partial<AutorMetadata>
  loading: boolean
  page: number
  pageSize: number
  filters: AutorFilters
  lastSorter: AutorSorter | undefined
  searchForm: ReturnType<typeof useForm<AutorSearchFormValues>>
  refresh: () => Promise<void>
  handleSearch: (values: AutorSearchFormValues) => Promise<void>
  handleClear: () => Promise<void>
  handleTableChange: (
    nextPage: number,
    nextPageSize: number,
    sorter: AutorSorter | undefined,
    sortChanged: boolean
  ) => Promise<void>
}

export function useAutorListViewModel({
  history,
  location
}: UseAutorListViewModelOptions): AutorListViewModel {
  const service = useMemo(() => AutorService.getInstance(), [])

  const core = useTaxonomiaListCore<AutorFilters, AutorSearchFormValues, AutorSorter, Autor>({
    history,
    location,
    cookieFiltersKey: COOKIE_FILTERS,
    cookieSorterKey: COOKIE_SORTER,
    parseSearch: parseAutorListSearch,
    hasRelevantUrlParams,
    buildSearch: buildAutorListSearch,
    fetchFn: (filters, pg, ps, sorter) => service.list(filters, pg, ps, sorter),
    emptyFilters: {},
    emptyFormValues: { autor: '' },
    toFilters,
    toFormDefaultValues,
    entityLabel: 'autores'
  })

  return {
    autores: core.items,
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
