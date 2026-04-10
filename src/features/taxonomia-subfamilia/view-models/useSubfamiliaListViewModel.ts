import { useMemo } from 'react'

import { useForm } from 'react-hook-form'
import type { RouteComponentProps } from 'react-router-dom'

import { useTaxonomiaListCore } from '@/features/taxonomia-shared/hooks/useTaxonomiaListCore'

import { SubfamiliaService } from '../services/SubfamiliaService'
import type {
  Subfamilia,
  SubfamiliaFilters,
  SubfamiliaMetadata,
  SubfamiliaSearchFormValues,
  SubfamiliaSorter
} from '../types'

const COOKIE_FILTERS = 'subfamilia_filters'
const COOKIE_SORTER = 'subfamilia_sorter'

function parseSubfamiliaListSearch(search: string): {
  filters: SubfamiliaFilters
  sorter: SubfamiliaSorter | undefined
} {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  const subfamilia = params.get('subfamilia')?.trim()
  const familia = params.get('familia')?.trim()
  const filters: SubfamiliaFilters = {}
  if (subfamilia) filters.subfamilia = subfamilia
  if (familia) filters.familia = familia
  const sortField = params.get('sortField')?.trim()
  const sortOrderRaw = params.get('sortOrder')
  const sortOrder
    = sortOrderRaw === 'ascend' || sortOrderRaw === 'descend' ? sortOrderRaw : undefined
  let sorter: SubfamiliaSorter | undefined
  if (sortField && sortOrder) {
    sorter = { field: sortField, order: sortOrder }
  } else {
    sorter = undefined
  }
  return { filters, sorter }
}

function hasRelevantUrlParams(search: string): boolean {
  const { filters, sorter } = parseSubfamiliaListSearch(search)
  return Boolean(filters.subfamilia || filters.familia) || Boolean(sorter?.field && sorter?.order)
}

function buildSubfamiliaListSearch(filters: SubfamiliaFilters, sorter: SubfamiliaSorter | undefined): string {
  const p = new URLSearchParams()
  const subfamilia = filters.subfamilia?.trim()
  const familia = filters.familia?.trim()
  if (subfamilia) {
    p.set('subfamilia', subfamilia)
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

function toFilters(values: SubfamiliaSearchFormValues): SubfamiliaFilters {
  const subfamilia = values.subfamilia?.trim()
  const familia = values.familia?.trim()
  const f: SubfamiliaFilters = {}
  if (subfamilia) f.subfamilia = subfamilia
  if (familia) f.familia = familia
  return f
}

function toFormDefaultValues(f: SubfamiliaFilters): SubfamiliaSearchFormValues {
  return {
    subfamilia: f.subfamilia ?? '',
    familia: f.familia ?? ''
  }
}

export interface UseSubfamiliaListViewModelOptions {
  history: RouteComponentProps['history']
  location: RouteComponentProps['location']
}

export interface SubfamiliaListViewModel {
  subfamilias: Subfamilia[]
  metadata: Partial<SubfamiliaMetadata>
  loading: boolean
  page: number
  pageSize: number
  filters: SubfamiliaFilters
  lastSorter: SubfamiliaSorter | undefined
  searchForm: ReturnType<typeof useForm<SubfamiliaSearchFormValues>>
  refresh: () => Promise<void>
  handleSearch: (values: SubfamiliaSearchFormValues) => Promise<void>
  handleClear: () => Promise<void>
  handleTableChange: (
    nextPage: number,
    nextPageSize: number,
    sorter: SubfamiliaSorter | undefined,
    sortChanged: boolean
  ) => Promise<void>
}

export function useSubfamiliaListViewModel({
  history,
  location
}: UseSubfamiliaListViewModelOptions): SubfamiliaListViewModel {
  const service = useMemo(() => SubfamiliaService.getInstance(), [])

  const core = useTaxonomiaListCore<
    SubfamiliaFilters,
    SubfamiliaSearchFormValues,
    SubfamiliaSorter,
    Subfamilia
  >({
    history,
    location,
    cookieFiltersKey: COOKIE_FILTERS,
    cookieSorterKey: COOKIE_SORTER,
    parseSearch: parseSubfamiliaListSearch,
    hasRelevantUrlParams,
    buildSearch: buildSubfamiliaListSearch,
    fetchFn: (filters, pg, ps, sorter) => service.list(filters, pg, ps, sorter),
    emptyFilters: {},
    emptyFormValues: { subfamilia: '', familia: '' },
    toFilters,
    toFormDefaultValues,
    entityLabel: 'subfamílias'
  })

  return {
    subfamilias: core.items,
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
