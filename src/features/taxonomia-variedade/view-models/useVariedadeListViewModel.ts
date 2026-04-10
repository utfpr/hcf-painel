import { useMemo } from 'react'

import { useForm } from 'react-hook-form'
import type { RouteComponentProps } from 'react-router-dom'

import { useTaxonomiaListCore } from '@/features/taxonomia-shared/hooks/useTaxonomiaListCore'

import { VariedadeService } from '../services/VariedadeService'
import type {
  Variedade,
  VariedadeFilters,
  VariedadeMetadata,
  VariedadeSearchFormValues,
  VariedadeSorter
} from '../types'

const COOKIE_FILTERS = 'variedade_filters'
const COOKIE_SORTER = 'variedade_sorter'

function parseVariedadeListSearch(search: string): {
  filters: VariedadeFilters
  sorter: VariedadeSorter | undefined
} {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  const filters: VariedadeFilters = {}
  const variedade = params.get('variedade')?.trim()
  const familia = params.get('familia')?.trim()
  const genero = params.get('genero')?.trim()
  const especie = params.get('especie')?.trim()
  if (variedade) filters.variedade = variedade
  if (familia) filters.familia = familia
  if (genero) filters.genero = genero
  if (especie) filters.especie = especie
  const sortField = params.get('sortField')?.trim()
  const sortOrderRaw = params.get('sortOrder')
  const sortOrder
    = sortOrderRaw === 'ascend' || sortOrderRaw === 'descend' ? sortOrderRaw : undefined
  let sorter: VariedadeSorter | undefined
  if (sortField && sortOrder) {
    sorter = { field: sortField, order: sortOrder }
  } else {
    sorter = undefined
  }
  return { filters, sorter }
}

function hasRelevantUrlParams(search: string): boolean {
  const { filters, sorter } = parseVariedadeListSearch(search)
  return Boolean(
    filters.variedade || filters.familia || filters.genero || filters.especie
  ) || Boolean(sorter?.field && sorter?.order)
}

function buildVariedadeListSearch(filters: VariedadeFilters, sorter: VariedadeSorter | undefined): string {
  const p = new URLSearchParams()
  if (filters.variedade?.trim()) p.set('variedade', filters.variedade.trim())
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

function toFilters(values: VariedadeSearchFormValues): VariedadeFilters {
  const f: VariedadeFilters = {}
  if (values.variedade?.trim()) f.variedade = values.variedade.trim()
  if (values.familia?.trim()) f.familia = values.familia.trim()
  if (values.genero?.trim()) f.genero = values.genero.trim()
  if (values.especie?.trim()) f.especie = values.especie.trim()
  return f
}

function toFormDefaultValues(f: VariedadeFilters): VariedadeSearchFormValues {
  return {
    variedade: f.variedade ?? '',
    familia: f.familia ?? '',
    genero: f.genero ?? '',
    especie: f.especie ?? ''
  }
}

export interface UseVariedadeListViewModelOptions {
  history: RouteComponentProps['history']
  location: RouteComponentProps['location']
}

export interface VariedadeListViewModel {
  variedades: Variedade[]
  metadata: Partial<VariedadeMetadata>
  loading: boolean
  page: number
  pageSize: number
  filters: VariedadeFilters
  lastSorter: VariedadeSorter | undefined
  searchForm: ReturnType<typeof useForm<VariedadeSearchFormValues>>
  refresh: () => Promise<void>
  handleSearch: (values: VariedadeSearchFormValues) => Promise<void>
  handleClear: () => Promise<void>
  handleTableChange: (
    nextPage: number,
    nextPageSize: number,
    sorter: VariedadeSorter | undefined,
    sortChanged: boolean
  ) => Promise<void>
}

export function useVariedadeListViewModel({
  history,
  location
}: UseVariedadeListViewModelOptions): VariedadeListViewModel {
  const service = useMemo(() => VariedadeService.getInstance(), [])

  const core = useTaxonomiaListCore<
    VariedadeFilters,
    VariedadeSearchFormValues,
    VariedadeSorter,
    Variedade
  >({
    history,
    location,
    cookieFiltersKey: COOKIE_FILTERS,
    cookieSorterKey: COOKIE_SORTER,
    parseSearch: parseVariedadeListSearch,
    hasRelevantUrlParams,
    buildSearch: buildVariedadeListSearch,
    fetchFn: (filters, pg, ps, sorter) => service.list(filters, pg, ps, sorter),
    emptyFilters: {},
    emptyFormValues: {
      variedade: '', familia: '', genero: '', especie: ''
    },
    toFilters,
    toFormDefaultValues,
    entityLabel: 'variedades'
  })

  return {
    variedades: core.items,
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
