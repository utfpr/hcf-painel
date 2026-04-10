import {
  useCallback, useEffect, useRef, useState
} from 'react'

import { useForm } from 'react-hook-form'
import type {
  DefaultValues, FieldValues, UseFormReturn
} from 'react-hook-form'
import type { RouteComponentProps } from 'react-router-dom'

import {
  getCookie, removeCookie, setCookie
} from '@/helpers/cookie'
import { useNotification } from '@/hooks/useNotification'

export interface TaxonomiaListResult<TItem> {
  results: TItem[]
  metadata: { total: number; page: number; limit: number }
}

function readFiltersFromCookie<F>(cookieKey: string): F {
  const raw = getCookie<F | string | undefined>(cookieKey)
  if (raw === undefined || raw === null) return {} as F
  if (typeof raw === 'object' && !Array.isArray(raw)) return raw
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw) as unknown
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        return parsed as F
      }
    } catch {
      /* invalid JSON */
    }
  }
  return {} as F
}

function readSorterFromCookie<S>(cookieKey: string): S | undefined {
  const raw = getCookie<S | string | undefined>(cookieKey)
  if (raw === undefined || raw === null) return undefined
  if (typeof raw === 'object' && !Array.isArray(raw)) return raw
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as S
    } catch {
      return undefined
    }
  }
  return undefined
}

function syncListUrl<F, S>(
  history: RouteComponentProps['history'],
  location: RouteComponentProps['location'],
  filters: F,
  sorter: S | undefined,
  buildSearch: (filters: F, sorter: S | undefined) => string
): void {
  const nextSearch = buildSearch(filters, sorter)
  const current = location.search ?? ''
  if (current === nextSearch) {
    return
  }
  history.replace({
    pathname: location.pathname,
    search: nextSearch === '' ? '' : nextSearch
  })
}

export interface UseTaxonomiaListCoreOptions<F, SF extends FieldValues, S, TItem> {
  history: RouteComponentProps['history']
  location: RouteComponentProps['location']
  cookieFiltersKey: string
  /** When omitted, list has no server-side sorting (URL/cookies). */
  cookieSorterKey?: string
  parseSearch: (search: string) => { filters: F; sorter: S | undefined }
  hasRelevantUrlParams: (search: string) => boolean
  buildSearch: (filters: F, sorter: S | undefined) => string
  fetchFn: (
    filters: F,
    page: number,
    pageSize: number,
    sorter: S | undefined
  ) => Promise<TaxonomiaListResult<TItem>>
  emptyFilters: F
  emptyFormValues: SF
  toFilters: (values: SF) => F
  toFormDefaultValues: (filters: F) => SF
  /** Shown in error toast: "Falha ao buscar {entityLabel}." */
  entityLabel: string
  initialPageSize?: number
}

export interface TaxonomiaListCoreResult<F, SF extends FieldValues, S, TItem> {
  items: TItem[]
  metadata: Partial<{ total: number; page: number; limit: number }>
  loading: boolean
  page: number
  pageSize: number
  filters: F
  lastSorter: S | undefined
  searchForm: UseFormReturn<SF>
  refresh: () => Promise<void>
  handleSearch: (values: SF) => Promise<void>
  handleClear: () => Promise<void>
  handleTableChange: (
    nextPage: number,
    nextPageSize: number,
    sorter?: S,
    sortChanged?: boolean
  ) => Promise<void>
}

export function useTaxonomiaListCore<F, SF extends FieldValues, S, TItem>({
  history,
  location,
  cookieFiltersKey,
  cookieSorterKey,
  parseSearch,
  hasRelevantUrlParams,
  buildSearch,
  fetchFn,
  emptyFilters,
  emptyFormValues,
  toFilters,
  toFormDefaultValues,
  entityLabel,
  initialPageSize = 20
}: UseTaxonomiaListCoreOptions<F, SF, S, TItem>): TaxonomiaListCoreResult<F, SF, S, TItem> {
  const sortable = Boolean(cookieSorterKey)
  const { showNotification } = useNotification()
  const notifyRef = useRef(showNotification)
  notifyRef.current = showNotification

  const historyRef = useRef(history)
  const locationRef = useRef(location)
  historyRef.current = history
  locationRef.current = location

  const locationSearchRef = useRef(location.search)

  /** Parent view-models pass new object/function refs each render; keep latest without unstable deps. */
  const parseSearchRef = useRef(parseSearch)
  parseSearchRef.current = parseSearch
  const hasRelevantUrlParamsRef = useRef(hasRelevantUrlParams)
  hasRelevantUrlParamsRef.current = hasRelevantUrlParams
  const buildSearchRef = useRef(buildSearch)
  buildSearchRef.current = buildSearch
  const fetchFnRef = useRef(fetchFn)
  fetchFnRef.current = fetchFn
  const emptyFiltersRef = useRef(emptyFilters)
  emptyFiltersRef.current = emptyFilters
  const emptyFormValuesRef = useRef(emptyFormValues)
  emptyFormValuesRef.current = emptyFormValues
  const toFiltersRef = useRef(toFilters)
  toFiltersRef.current = toFilters
  const entityLabelRef = useRef(entityLabel)
  entityLabelRef.current = entityLabel

  const getInitialListState = useCallback(
    (search: string): { filters: F; sorter: S | undefined } => {
      if (hasRelevantUrlParamsRef.current(search)) {
        return parseSearchRef.current(search)
      }
      return {
        filters: readFiltersFromCookie<F>(cookieFiltersKey),
        sorter: sortable && cookieSorterKey ? readSorterFromCookie<S>(cookieSorterKey) : undefined
      }
    },
    [
      cookieFiltersKey,
      cookieSorterKey,
      sortable
    ]
  )

  const [items, setItems] = useState<TItem[]>([])
  const [metadata, setMetadata] = useState<Partial<{ total: number; page: number; limit: number }>>({})
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const pageSizeRef = useRef(pageSize)
  pageSizeRef.current = pageSize
  const [filters, setFilters] = useState<F>(() => getInitialListState(location.search).filters)
  const [lastSorter, setLastSorter] = useState<S | undefined>(() => {
    const s = getInitialListState(location.search).sorter
    return sortable ? s : undefined
  })
  const [loading, setLoading] = useState(false)

  const searchForm = useForm<SF>({
    defaultValues: toFormDefaultValues(getInitialListState(location.search).filters) as DefaultValues<SF>
  })

  const fetchWithParams = useCallback(
    async (
      nextFilters: F,
      nextPage: number,
      nextPageSize: number,
      nextSorter: S | undefined
    ) => {
      setLoading(true)
      try {
        const data = await fetchFnRef.current(nextFilters, nextPage, nextPageSize, nextSorter)
        setItems(data.results)
        setMetadata(data.metadata)
        setPage(data.metadata.page)
        setPageSize(data.metadata.limit)
        setFilters(nextFilters)
        if (sortable) {
          setLastSorter(nextSorter)
        }
        syncListUrl(
          historyRef.current,
          locationRef.current,
          nextFilters,
          sortable ? nextSorter : undefined,
          buildSearchRef.current
        )
      } catch {
        notifyRef.current({
          type: 'error',
          message: 'Erro',
          description: `Falha ao buscar ${entityLabelRef.current}.`
        })
      } finally {
        setLoading(false)
        locationSearchRef.current = buildSearchRef.current(nextFilters, sortable ? nextSorter : undefined)
      }
    },
    [sortable]
  )

  useEffect(() => {
    const init = getInitialListState(location.search)
    void fetchWithParams(init.filters, 1, initialPageSize, sortable ? init.sorter : undefined)
  }, [fetchWithParams])

  useEffect(() => {
    if (location.search === locationSearchRef.current) {
      return
    }
    const next = parseSearchRef.current(location.search)
    const ps = pageSizeRef.current
    if (!hasRelevantUrlParamsRef.current(location.search)) {
      void fetchWithParams(emptyFiltersRef.current, 1, ps, undefined)
      return
    }
    void fetchWithParams(next.filters, 1, ps, sortable ? next.sorter : undefined)
  }, [
    fetchWithParams,
    location.search,
    sortable
  ])

  const refresh = useCallback(async () => {
    await fetchWithParams(filters, page, pageSize, sortable ? lastSorter : undefined)
  }, [
    fetchWithParams,
    filters,
    lastSorter,
    page,
    pageSize,
    sortable
  ])

  const handleSearch = useCallback(
    async (values: SF) => {
      const searchFilters = toFiltersRef.current(values)
      setCookie(cookieFiltersKey, JSON.stringify(searchFilters))
      await fetchWithParams(searchFilters, 1, pageSize, sortable ? lastSorter : undefined)
    },
    [
      cookieFiltersKey,
      fetchWithParams,
      lastSorter,
      pageSize,
      sortable
    ]
  )

  const handleClear = useCallback(async () => {
    searchForm.reset(emptyFormValuesRef.current)
    removeCookie(cookieFiltersKey)
    if (sortable && cookieSorterKey) {
      removeCookie(cookieSorterKey)
    }
    await fetchWithParams(emptyFiltersRef.current, 1, pageSize, undefined)
  }, [
    cookieFiltersKey,
    cookieSorterKey,
    fetchWithParams,
    pageSize,
    searchForm,
    sortable
  ])

  const handleTableChange = useCallback(
    async (
      nextPage: number,
      nextPageSize: number,
      sorter?: S,
      sortChanged?: boolean
    ) => {
      if (!sortable) {
        await fetchWithParams(filters, nextPage, nextPageSize, undefined)
        return
      }
      if (sortChanged || sorter !== lastSorter) {
        if (sorter) {
          setCookie(cookieSorterKey!, JSON.stringify(sorter))
        } else if (cookieSorterKey) {
          removeCookie(cookieSorterKey)
        }
      }
      const pg = sortChanged ? 1 : nextPage
      const ps = nextPageSize
      await fetchWithParams(filters, pg, ps, sorter)
    },
    [
      cookieSorterKey,
      fetchWithParams,
      filters,
      lastSorter,
      sortable
    ]
  )

  return {
    items,
    metadata,
    loading,
    page,
    pageSize,
    filters,
    lastSorter: sortable ? lastSorter : undefined,
    searchForm,
    refresh,
    handleSearch,
    handleClear,
    handleTableChange
  }
}
