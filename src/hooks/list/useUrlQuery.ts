import { useCallback, useMemo } from 'react'

import { useSearchParamsStore } from '@/libraries/router'

export function queryPatchToUrlUpdates<T extends Record<string, string>>(
  patch: Partial<T>,
  defaults: T,
  names?: Partial<{ [K in keyof T]: string }>
): Record<string, string | null> {
  const updates: Record<string, string | null> = {}
  for (const key of Object.keys(patch) as (keyof T)[]) {
    const value = patch[key]
    if (value === undefined) continue
    const urlName = names?.[key] ?? String(key)
    if (value === '' || value === defaults[key]) updates[urlName] = null
    else updates[urlName] = String(value)
  }
  return updates
}

export function useUrlQuery<T extends Record<string, string>>(options: {
  defaults: T
  names?: Partial<{ [K in keyof T]: string }>
  allowedSortKeys?: readonly string[]
  sortFieldKey?: keyof T
  sortOrderKey?: keyof T
}): {
  values: T
  set: (patch: Partial<T>) => void
  clear: (keys?: (keyof T)[]) => void
} {
  const {
    defaults,
    names,
    allowedSortKeys
  } = options
  const sortFieldKey = options.sortFieldKey ?? (
    'sort' in defaults ? 'sort' as keyof T : undefined
  )
  const sortOrderKey = options.sortOrderKey ?? (
    'order' in defaults ? 'order' as keyof T : undefined
  )

  const store = useSearchParamsStore()

  const values = useMemo(() => {
    const next = { ...defaults }
    for (const key of Object.keys(defaults) as (keyof T)[]) {
      const urlName = names?.[key] ?? String(key)
      const raw = store.params.get(urlName)
      if (raw !== null) next[key] = raw as T[keyof T]
    }

    if (sortFieldKey && sortOrderKey) {
      const sort = next[sortFieldKey]
      const order = next[sortOrderKey]
      const sortOk = !allowedSortKeys || allowedSortKeys.includes(sort)
      const orderOk = order === 'asc' || order === 'desc'
      if (!sort || !sortOk || !orderOk) {
        next[sortFieldKey] = defaults[sortFieldKey]
        next[sortOrderKey] = defaults[sortOrderKey]
      }
    }

    return next
  }, [
    allowedSortKeys,
    defaults,
    names,
    sortFieldKey,
    sortOrderKey,
    store.params
  ])

  const set = useCallback((patch: Partial<T>) => {
    store.patch(queryPatchToUrlUpdates(patch, defaults, names))
  }, [
    defaults,
    names,
    store
  ])

  const clear = useCallback((keys?: (keyof T)[]) => {
    const keysToClear = keys ?? (Object.keys(defaults) as (keyof T)[])
    const patch = {} as Partial<T>
    for (const key of keysToClear) {
      patch[key] = defaults[key]
    }
    store.patch(queryPatchToUrlUpdates(patch, defaults, names))
  }, [
    defaults,
    names,
    store
  ])

  return {
    values,
    set,
    clear
  }
}
