import { useCallback, useMemo } from 'react'

import { useSearchParamsStore } from '@/libraries/router'

const DEFAULT_PAGE_SIZE_OPTIONS = [
  20,
  50,
  100
] as const

function parsePage(value: string | null): number {
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < 1) return 1
  return parsed
}

function parsePageSize(
  value: string | null,
  defaultPageSize: number,
  pageSizeOptions: readonly number[]
): number {
  const parsed = Number(value)
  if (pageSizeOptions.includes(parsed)) return parsed
  return defaultPageSize
}

export function paginationToUrlUpdates(options: {
  page: number
  pageSize: number
  pageKey?: string
  pageSizeKey?: string
  defaultPageSize: number
}): Record<string, string | null> {
  const pageKey = options.pageKey ?? 'page'
  const pageSizeKey = options.pageSizeKey ?? 'pageSize'
  return {
    [pageKey]: options.page > 1 ? String(options.page) : null,
    [pageSizeKey]: options.pageSize === options.defaultPageSize
      ? null
      : String(options.pageSize)
  }
}

export function useUrlPagination(options?: {
  pageKey?: string
  pageSizeKey?: string
  defaultPageSize?: number
  pageSizeOptions?: readonly number[]
}): {
  page: number
  pageSize: number
  setPage: (page: number) => void
  setPageSize: (pageSize: number) => void
  setPagination: (page: number, pageSize: number) => void
} {
  const pageKey = options?.pageKey ?? 'page'
  const pageSizeKey = options?.pageSizeKey ?? 'pageSize'
  const defaultPageSize = options?.defaultPageSize ?? 20
  const pageSizeOptions = options?.pageSizeOptions ?? DEFAULT_PAGE_SIZE_OPTIONS

  const store = useSearchParamsStore()

  const page = useMemo(
    () => parsePage(store.params.get(pageKey)),
    [pageKey, store.params]
  )

  const pageSize = useMemo(
    () => parsePageSize(store.params.get(pageSizeKey), defaultPageSize, pageSizeOptions),
    [
      defaultPageSize,
      pageSizeKey,
      pageSizeOptions,
      store.params
    ]
  )

  const setPage = useCallback((nextPage: number) => {
    store.patch({
      [pageKey]: nextPage > 1 ? String(nextPage) : null
    })
  }, [
    pageKey,
    store
  ])

  const setPageSize = useCallback((nextPageSize: number) => {
    store.patch({
      [pageKey]: null,
      [pageSizeKey]: nextPageSize === defaultPageSize ? null : String(nextPageSize)
    })
  }, [
    defaultPageSize,
    pageKey,
    pageSizeKey,
    store
  ])

  const setPagination = useCallback((nextPage: number, nextPageSize: number) => {
    store.patch(paginationToUrlUpdates({
      page: nextPage,
      pageSize: nextPageSize,
      pageKey,
      pageSizeKey,
      defaultPageSize
    }))
  }, [
    defaultPageSize,
    pageKey,
    pageSizeKey,
    store
  ])

  return {
    page,
    pageSize,
    setPage,
    setPageSize,
    setPagination
  }
}
