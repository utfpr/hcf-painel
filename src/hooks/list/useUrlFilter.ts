import { useCallback, useMemo } from 'react'

import { useSearchParamsStore } from '@/libraries/router'

export function filterPatchToUrlUpdates<T extends Record<string, string>>(
  patch: Partial<T>,
  defaults: T
): Record<string, string | null> {
  const updates: Record<string, string | null> = {}
  for (const key of Object.keys(patch) as (keyof T)[]) {
    const value = patch[key]
    if (value === undefined) continue
    const urlName = String(key)
    if (value === '' || value === defaults[key]) updates[urlName] = null
    else updates[urlName] = String(value)
  }
  return updates
}

export function useUrlFilter<T extends Record<string, string>>(options: {
  defaults: T
}): {
  values: T
  set: (patch: Partial<T>) => void
  clear: (keys?: (keyof T)[]) => void
} {
  const { defaults } = options
  const store = useSearchParamsStore()

  const values = useMemo(() => {
    const next = { ...defaults }
    for (const key of Object.keys(defaults) as (keyof T)[]) {
      const raw = store.params.get(String(key))
      if (raw !== null) next[key] = raw as T[keyof T]
    }
    return next
  }, [
    defaults,
    store.params
  ])

  const set = useCallback((patch: Partial<T>) => {
    store.patch(filterPatchToUrlUpdates(patch, defaults))
  }, [
    defaults,
    store
  ])

  const clear = useCallback((keys?: (keyof T)[]) => {
    const keysToClear = keys ?? (Object.keys(defaults) as (keyof T)[])
    const patch = {} as Partial<T>
    for (const key of keysToClear) {
      patch[key] = defaults[key]
    }
    store.patch(filterPatchToUrlUpdates(patch, defaults))
  }, [
    defaults,
    store
  ])

  return {
    values,
    set,
    clear
  }
}
