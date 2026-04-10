import { useMemo } from 'react'

import { useForm } from 'react-hook-form'
import type { RouteComponentProps } from 'react-router-dom'

import { useTaxonomiaListCore } from '@/features/taxonomia-shared/hooks/useTaxonomiaListCore'

import { FamiliaService } from '../services/FamiliaService'
import type {
  Familia,
  FamiliaFilters,
  FamiliaMetadata,
  FamiliaSearchFormValues,
  FamiliaSorter
} from '../types'

const COOKIE_FILTERS = 'familia_filters'
const COOKIE_SORTER = 'familia_sorter'

function parseFamiliaListSearch(search: string): {
  filters: FamiliaFilters
  sorter: FamiliaSorter | undefined
} {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  const familia = params.get('familia')?.trim()
  const filters: FamiliaFilters = familia ? { familia } : {}
  const sortField = params.get('sortField')?.trim()
  const sortOrderRaw = params.get('sortOrder')
  const sortOrder
    = sortOrderRaw === 'ascend' || sortOrderRaw === 'descend' ? sortOrderRaw : undefined
  let sorter: FamiliaSorter | undefined
  if (sortField && sortOrder) {
    sorter = { field: sortField, order: sortOrder }
  } else {
    sorter = undefined
  }
  return { filters, sorter }
}

function hasRelevantUrlParams(search: string): boolean {
  const { filters, sorter } = parseFamiliaListSearch(search)
  return Boolean(filters.familia) || Boolean(sorter?.field && sorter?.order)
}

function buildFamiliaListSearch(filters: FamiliaFilters, sorter: FamiliaSorter | undefined): string {
  const p = new URLSearchParams()
  const familia = filters.familia?.trim()
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

function toFilters(values: FamiliaSearchFormValues): FamiliaFilters {
  const trimmed = values.familia?.trim()
  return trimmed ? { familia: trimmed } : {}
}

function toFormDefaultValues(f: FamiliaFilters): FamiliaSearchFormValues {
  return { familia: f.familia ?? '' }
}

export interface UseFamiliaListViewModelOptions {
  history: RouteComponentProps['history']
  location: RouteComponentProps['location']
}

export interface FamiliaListViewModel {
  familias: Familia[]
  metadata: Partial<FamiliaMetadata>
  loading: boolean
  page: number
  pageSize: number
  filters: FamiliaFilters
  lastSorter: FamiliaSorter | undefined
  searchForm: ReturnType<typeof useForm<FamiliaSearchFormValues>>
  refresh: () => Promise<void>
  handleSearch: (values: FamiliaSearchFormValues) => Promise<void>
  handleClear: () => Promise<void>
  handleTableChange: (
    nextPage: number,
    nextPageSize: number,
    sorter: FamiliaSorter | undefined,
    sortChanged: boolean
  ) => Promise<void>
}

export function useFamiliaListViewModel({
  history,
  location
}: UseFamiliaListViewModelOptions): FamiliaListViewModel {
  const service = useMemo(() => FamiliaService.getInstance(), [])

  const core = useTaxonomiaListCore<FamiliaFilters, FamiliaSearchFormValues, FamiliaSorter, Familia>({
    history,
    location,
    cookieFiltersKey: COOKIE_FILTERS,
    cookieSorterKey: COOKIE_SORTER,
    parseSearch: parseFamiliaListSearch,
    hasRelevantUrlParams,
    buildSearch: buildFamiliaListSearch,
    fetchFn: (filters, pg, ps, sorter) => service.list(filters, pg, ps, sorter),
    emptyFilters: {},
    emptyFormValues: { familia: '' },
    toFilters,
    toFormDefaultValues,
    entityLabel: 'famílias'
  })

  return {
    familias: core.items,
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
