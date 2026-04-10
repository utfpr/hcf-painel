import { useCallback, useMemo } from 'react'

import { useForm } from 'react-hook-form'
import type { RouteComponentProps } from 'react-router-dom'

import { useTaxonomiaListCore } from '@/features/taxonomia-shared/hooks/useTaxonomiaListCore'

import { TaxonomiaScreenService } from '../services/TaxonomiaScreenService'
import type {
  TaxonomiaFilters,
  TaxonomiaListItem,
  TaxonomiaMetadata,
  TaxonomiaSearchFormValues
} from '../types'

const COOKIE_FILTERS = 'taxonomia_screen_filters'

function parseSearch(search: string): TaxonomiaFilters {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  const f: TaxonomiaFilters = {}
  const familia = params.get('familia')?.trim()
  const subfamilia = params.get('subfamilia')?.trim()
  const genero = params.get('genero')?.trim()
  const especie = params.get('especie')?.trim()
  const subespecie = params.get('subespecie')?.trim()
  const variedade = params.get('variedade')?.trim()
  if (familia) f.familia = familia
  if (subfamilia) f.subfamilia = subfamilia
  if (genero) f.genero = genero
  if (especie) f.especie = especie
  if (subespecie) f.subespecie = subespecie
  if (variedade) f.variedade = variedade
  return f
}

function parseTaxonomiaScreenSearch(search: string): {
  filters: TaxonomiaFilters
  sorter: undefined
} {
  return { filters: parseSearch(search), sorter: undefined }
}

function hasUrlFilters(search: string): boolean {
  const f = parseSearch(search)
  return Boolean(
    f.familia || f.subfamilia || f.genero || f.especie || f.subespecie || f.variedade
  )
}

function buildSearch(filters: TaxonomiaFilters, _sorter: undefined): string {
  const p = new URLSearchParams()
  if (filters.familia?.trim()) p.set('familia', filters.familia.trim())
  if (filters.subfamilia?.trim()) p.set('subfamilia', filters.subfamilia.trim())
  if (filters.genero?.trim()) p.set('genero', filters.genero.trim())
  if (filters.especie?.trim()) p.set('especie', filters.especie.trim())
  if (filters.subespecie?.trim()) p.set('subespecie', filters.subespecie.trim())
  if (filters.variedade?.trim()) p.set('variedade', filters.variedade.trim())
  const s = p.toString()
  return s ? `?${s}` : ''
}

function toFilters(values: TaxonomiaSearchFormValues): TaxonomiaFilters {
  const f: TaxonomiaFilters = {}
  if (values.familia?.trim()) f.familia = values.familia.trim()
  if (values.subfamilia?.trim()) f.subfamilia = values.subfamilia.trim()
  if (values.genero?.trim()) f.genero = values.genero.trim()
  if (values.especie?.trim()) f.especie = values.especie.trim()
  if (values.subespecie?.trim()) f.subespecie = values.subespecie.trim()
  if (values.variedade?.trim()) f.variedade = values.variedade.trim()
  return f
}

function toFormDefaultValues(f: TaxonomiaFilters): TaxonomiaSearchFormValues {
  return {
    familia: f.familia ?? '',
    subfamilia: f.subfamilia ?? '',
    genero: f.genero ?? '',
    especie: f.especie ?? '',
    subespecie: f.subespecie ?? '',
    variedade: f.variedade ?? ''
  }
}

const emptyForm: TaxonomiaSearchFormValues = {
  familia: '',
  subfamilia: '',
  genero: '',
  especie: '',
  subespecie: '',
  variedade: ''
}

export interface UseTaxonomiaScreenListViewModelOptions {
  history: RouteComponentProps['history']
  location: RouteComponentProps['location']
}

export interface TaxonomiaScreenListViewModel {
  taxonomias: TaxonomiaListItem[]
  metadata: Partial<TaxonomiaMetadata>
  loading: boolean
  page: number
  pageSize: number
  filters: TaxonomiaFilters
  searchForm: ReturnType<typeof useForm<TaxonomiaSearchFormValues>>
  refresh: () => Promise<void>
  handleSearch: (values: TaxonomiaSearchFormValues) => Promise<void>
  handleClear: () => Promise<void>
  handleTableChange: (nextPage: number, nextPageSize: number) => Promise<void>
}

export function useTaxonomiaScreenListViewModel({
  history,
  location
}: UseTaxonomiaScreenListViewModelOptions): TaxonomiaScreenListViewModel {
  const service = useMemo(() => TaxonomiaScreenService.getInstance(), [])

  const core = useTaxonomiaListCore<
    TaxonomiaFilters,
    TaxonomiaSearchFormValues,
    undefined,
    TaxonomiaListItem
  >({
    history,
    location,
    cookieFiltersKey: COOKIE_FILTERS,
    parseSearch: parseTaxonomiaScreenSearch,
    hasRelevantUrlParams: hasUrlFilters,
    buildSearch,
    fetchFn: (filters, pg, ps, _sorter) => service.list(filters, pg, ps),
    emptyFilters: {},
    emptyFormValues: emptyForm,
    toFilters,
    toFormDefaultValues,
    entityLabel: 'taxonomias'
  })

  const handleTableChange = useCallback(
    async (nextPage: number, nextPageSize: number) => {
      await core.handleTableChange(nextPage, nextPageSize)
    },
    [core]
  )

  return {
    taxonomias: core.items,
    metadata: core.metadata,
    loading: core.loading,
    page: core.page,
    pageSize: core.pageSize,
    filters: core.filters,
    searchForm: core.searchForm,
    refresh: core.refresh,
    handleSearch: core.handleSearch,
    handleClear: core.handleClear,
    handleTableChange
  }
}
