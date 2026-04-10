import { useMemo } from 'react'

import { useForm } from 'react-hook-form'
import type { RouteComponentProps } from 'react-router-dom'

import { useTaxonomiaListCore } from '@/features/taxonomia-shared/hooks/useTaxonomiaListCore'

import { ReinoService } from '../services/ReinoService'
import type {
  Reino,
  ReinoFilters,
  ReinoMetadata,
  ReinoSearchFormValues,
  ReinoSorter
} from '../types'

const COOKIE_FILTERS = 'reino_filters'
const COOKIE_SORTER = 'reino_sorter'

function parseReinoListSearch(search: string): {
  filters: ReinoFilters
  sorter: ReinoSorter | undefined
} {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  const reino = params.get('reino')?.trim()
  const filters: ReinoFilters = reino ? { reino } : {}
  const sortField = params.get('sortField')?.trim()
  const sortOrderRaw = params.get('sortOrder')
  const sortOrder
    = sortOrderRaw === 'ascend' || sortOrderRaw === 'descend' ? sortOrderRaw : undefined
  let sorter: ReinoSorter | undefined
  if (sortField && sortOrder) {
    sorter = { field: sortField, order: sortOrder }
  } else {
    sorter = undefined
  }
  return { filters, sorter }
}

function hasRelevantUrlParams(search: string): boolean {
  const { filters, sorter } = parseReinoListSearch(search)
  return Boolean(filters.reino) || Boolean(sorter?.field && sorter?.order)
}

function buildReinoListSearch(filters: ReinoFilters, sorter: ReinoSorter | undefined): string {
  const p = new URLSearchParams()
  const reino = filters.reino?.trim()
  if (reino) {
    p.set('reino', reino)
  }
  if (sorter?.field && sorter?.order) {
    p.set('sortField', sorter.field)
    p.set('sortOrder', sorter.order)
  }
  const s = p.toString()
  return s ? `?${s}` : ''
}

function toFilters(values: ReinoSearchFormValues): ReinoFilters {
  const trimmed = values.reino?.trim()
  return trimmed ? { reino: trimmed } : {}
}

function toFormDefaultValues(f: ReinoFilters): ReinoSearchFormValues {
  return { reino: f.reino ?? '' }
}

export interface UseReinoListViewModelOptions {
  history: RouteComponentProps['history']
  location: RouteComponentProps['location']
}

export interface ReinoListViewModel {
  reinos: Reino[]
  metadata: Partial<ReinoMetadata>
  loading: boolean
  page: number
  pageSize: number
  filters: ReinoFilters
  lastSorter: ReinoSorter | undefined
  searchForm: ReturnType<typeof useForm<ReinoSearchFormValues>>
  refresh: () => Promise<void>
  handleSearch: (values: ReinoSearchFormValues) => Promise<void>
  handleClear: () => Promise<void>
  handleTableChange: (
    nextPage: number,
    nextPageSize: number,
    sorter: ReinoSorter | undefined,
    sortChanged: boolean
  ) => Promise<void>
}

export function useReinoListViewModel({
  history,
  location
}: UseReinoListViewModelOptions): ReinoListViewModel {
  const service = useMemo(() => ReinoService.getInstance(), [])

  const core = useTaxonomiaListCore<ReinoFilters, ReinoSearchFormValues, ReinoSorter, Reino>({
    history,
    location,
    cookieFiltersKey: COOKIE_FILTERS,
    cookieSorterKey: COOKIE_SORTER,
    parseSearch: parseReinoListSearch,
    hasRelevantUrlParams,
    buildSearch: buildReinoListSearch,
    fetchFn: (filters, pg, ps, sorter) => service.list(filters, pg, ps, sorter),
    emptyFilters: {},
    emptyFormValues: { reino: '' },
    toFilters,
    toFormDefaultValues,
    entityLabel: 'reinos'
  })

  return {
    reinos: core.items,
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
