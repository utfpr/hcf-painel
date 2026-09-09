import { useCallback, useMemo } from 'react'

import type { DataTableChange, DataTableSort } from '@/components/list/DataTable'
import { useSearchParamsStore } from '@/libraries/router'

import { useColumnVisibility } from './useColumnVisibility'
import { paginationToUrlUpdates, useUrlPagination } from './useUrlPagination'
import { queryPatchToUrlUpdates, useUrlQuery } from './useUrlQuery'

function sortFromQuery(
  query: Record<string, string>,
  sortFieldKey: string,
  sortOrderKey: string
): DataTableSort | null {
  const key = query[sortFieldKey]
  const order = query[sortOrderKey]
  if (key && (order === 'asc' || order === 'desc')) {
    return {
      key,
      order
    }
  }
  return null
}

function sortsEqual(left: DataTableSort | null, right: DataTableSort | null): boolean {
  if (left === null && right === null) return true
  if (left === null || right === null) return false
  return left.key === right.key && left.order === right.order
}

export function useDataListParams<Q extends Record<string, string>>(options: {
  defaults: Q
  storageKey: string
  allowedSortKeys?: readonly string[]
  pageSizeOptions?: readonly number[]
  defaultPageSize?: number
  columnKeys: readonly string[]
  mandatoryColumnKeys?: readonly string[]
  names?: Partial<{ [K in keyof Q]: string }>
  pageKey?: string
  pageSizeKey?: string
}): {
  query: Q
  setQuery: (patch: Partial<Q>) => void
  clearQuery: (keys?: (keyof Q)[]) => void
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
  const sortFieldKey = ('sort' in options.defaults ? 'sort' : undefined) as keyof Q | undefined
  const sortOrderKey = ('order' in options.defaults ? 'order' : undefined) as keyof Q | undefined

  const store = useSearchParamsStore()
  const queryState = useUrlQuery({
    defaults: options.defaults,
    names: options.names,
    allowedSortKeys: options.allowedSortKeys
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
    () => sortFieldKey && sortOrderKey
      ? sortFromQuery(queryState.values, String(sortFieldKey), String(sortOrderKey))
      : null,
    [
      queryState.values,
      sortFieldKey,
      sortOrderKey
    ]
  )

  const hasActiveFilters = useMemo(() => {
    return (Object.keys(options.defaults) as (keyof Q)[]).some(key => {
      if (key === sortFieldKey || key === sortOrderKey) return false
      return queryState.values[key] !== options.defaults[key]
    })
  }, [
    options.defaults,
    queryState.values,
    sortFieldKey,
    sortOrderKey
  ])

  const setQuery = useCallback((patch: Partial<Q>) => {
    store.patch({
      ...queryPatchToUrlUpdates(patch, options.defaults, options.names),
      [pageKey]: null
    })
  }, [
    options.defaults,
    options.names,
    pageKey,
    store
  ])

  const clearQuery = useCallback((keys?: (keyof Q)[]) => {
    const keysToClear = keys ?? (Object.keys(options.defaults) as (keyof Q)[])
    const patch = {} as Partial<Q>
    for (const key of keysToClear) {
      patch[key] = options.defaults[key]
    }
    store.patch({
      ...queryPatchToUrlUpdates(patch, options.defaults, options.names),
      [pageKey]: null
    })
  }, [
    options.defaults,
    options.names,
    pageKey,
    store
  ])

  const applyTableChange = useCallback((next: DataTableChange) => {
    const sortChanged = !sortsEqual(sort, next.sort)
    const pageSizeChanged = next.pageSize !== pagination.pageSize
    const updates: Record<string, string | null> = {}

    if (sortChanged && sortFieldKey && sortOrderKey) {
      const sortName = options.names?.[sortFieldKey] ?? String(sortFieldKey)
      const orderName = options.names?.[sortOrderKey] ?? String(sortOrderKey)
      if (next.sort) {
        updates[sortName] = next.sort.key
        updates[orderName] = next.sort.order
      } else {
        updates[sortName] = null
        updates[orderName] = null
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
    defaultPageSize,
    options.names,
    pageKey,
    pageSizeKey,
    pagination.pageSize,
    sort,
    sortFieldKey,
    sortOrderKey,
    store
  ])

  return {
    query: queryState.values,
    setQuery,
    clearQuery,
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
