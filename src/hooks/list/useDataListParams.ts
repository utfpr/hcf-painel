import { useCallback, useMemo } from 'react'

import type { DataTableChange, DataTableSort } from '@/components/list/DataTable'
import { useSearchParamsStore } from '@/libraries/router'

import { useColumnVisibility } from './useColumnVisibility'
import { filterPatchToUrlUpdates, useUrlFilter } from './useUrlFilter'
import { paginationToUrlUpdates, useUrlPagination } from './useUrlPagination'

const SORT_KEY = 'sort'
const ORDER_KEY = 'order'

function sortFromParams(
  params: URLSearchParams,
  allowedSortKeys: readonly string[]
): DataTableSort | null {
  const key = params.get(SORT_KEY)
  const order = params.get(ORDER_KEY)
  if (!key || !allowedSortKeys.includes(key)) return null
  if (order !== 'asc' && order !== 'desc') return null
  return {
    key,
    order
  }
}

function sortsEqual(left: DataTableSort | null, right: DataTableSort | null): boolean {
  if (left === null && right === null) return true
  if (left === null || right === null) return false
  return left.key === right.key && left.order === right.order
}

export function useDataListParams<F extends Record<string, string>>(options: {
  defaults: F
  storageKey: string
  allowedSortKeys?: readonly string[]
  pageSizeOptions?: readonly number[]
  defaultPageSize?: number
  columnKeys: readonly string[]
  mandatoryColumnKeys?: readonly string[]
  pageKey?: string
  pageSizeKey?: string
}): {
  filter: F
  setFilter: (patch: Partial<F>) => void
  clearFilter: (keys?: (keyof F)[]) => void
  page: number
  pageSize: number
  setPagination: (page: number, pageSize: number) => void
  sort: DataTableSort | null
  applyTableChange: (next: DataTableChange) => void
  visibleKeys: string[]
  setVisibleKeys: (keys: string[]) => void
  resetColumns: () => void
  hasActiveFilters: boolean
} {
  const pageKey = options.pageKey ?? 'page'
  const pageSizeKey = options.pageSizeKey ?? 'pageSize'
  const defaultPageSize = options.defaultPageSize ?? 20
  const allowedSortKeys = options.allowedSortKeys ?? []

  const store = useSearchParamsStore()
  const filterState = useUrlFilter({
    defaults: options.defaults
  })
  const pagination = useUrlPagination({
    pageKey,
    pageSizeKey,
    defaultPageSize,
    pageSizeOptions: options.pageSizeOptions
  })
  const columns = useColumnVisibility({
    storageKey: options.storageKey,
    defaults: options.columnKeys,
    mandatory: options.mandatoryColumnKeys
  })

  const sort = useMemo(
    () => sortFromParams(store.params, allowedSortKeys),
    [
      allowedSortKeys,
      store.params
    ]
  )

  const hasActiveFilters = useMemo(() => {
    return (Object.keys(options.defaults) as (keyof F)[]).some(key => {
      return filterState.values[key] !== options.defaults[key]
    })
  }, [
    filterState.values,
    options.defaults
  ])

  const setFilter = useCallback((patch: Partial<F>) => {
    store.patch({
      ...filterPatchToUrlUpdates(patch, options.defaults),
      [pageKey]: null
    })
  }, [
    options.defaults,
    pageKey,
    store
  ])

  const clearFilter = useCallback((keys?: (keyof F)[]) => {
    const keysToClear = keys ?? (Object.keys(options.defaults) as (keyof F)[])
    const patch = {} as Partial<F>
    for (const key of keysToClear) {
      patch[key] = options.defaults[key]
    }
    store.patch({
      ...filterPatchToUrlUpdates(patch, options.defaults),
      [pageKey]: null
    })
  }, [
    options.defaults,
    pageKey,
    store
  ])

  const applyTableChange = useCallback((next: DataTableChange) => {
    const sortChanged = !sortsEqual(sort, next.sort)
    const pageSizeChanged = next.pageSize !== pagination.pageSize
    const updates: Record<string, string | null> = {}

    if (sortChanged) {
      if (next.sort && allowedSortKeys.includes(next.sort.key)) {
        updates[SORT_KEY] = next.sort.key
        updates[ORDER_KEY] = next.sort.order
      } else {
        updates[SORT_KEY] = null
        updates[ORDER_KEY] = null
      }
    }

    if (sortChanged || pageSizeChanged) {
      Object.assign(updates, paginationToUrlUpdates({
        page: 1,
        pageSize: next.pageSize,
        pageKey,
        pageSizeKey,
        defaultPageSize
      }))
    } else {
      Object.assign(updates, paginationToUrlUpdates({
        page: next.page,
        pageSize: next.pageSize,
        pageKey,
        pageSizeKey,
        defaultPageSize
      }))
    }

    store.patch(updates)
  }, [
    allowedSortKeys,
    defaultPageSize,
    pageKey,
    pageSizeKey,
    pagination.pageSize,
    sort,
    store
  ])

  return {
    filter: filterState.values,
    setFilter,
    clearFilter,
    page: pagination.page,
    pageSize: pagination.pageSize,
    setPagination: pagination.setPagination,
    sort,
    applyTableChange,
    visibleKeys: columns.visibleKeys,
    setVisibleKeys: columns.setVisibleKeys,
    resetColumns: columns.reset,
    hasActiveFilters
  }
}
