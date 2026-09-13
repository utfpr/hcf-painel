import { useCallback, useMemo } from 'react'

import { useLocalStorage } from '@/hooks/useLocalStorage'

export function useColumnVisibility<K extends string>(options: {
  storageKey: string
  defaults: readonly K[]
  mandatory?: readonly K[]
}): {
  visibleKeys: K[]
  setVisibleKeys: (keys: string[]) => void
  reset: () => void
} {
  const { storageKey, defaults } = options
  const mandatory = options.mandatory ?? []
  const allowed = useMemo(() => new Set<string>(defaults), [defaults])

  const [stored, setStored] = useLocalStorage<K[]>(storageKey, [...defaults])

  const visibleKeys = useMemo(() => {
    const keys = (stored ?? [...defaults]).filter((key): key is K => allowed.has(key))
    return Array.from(new Set([...mandatory, ...keys]))
  }, [
    allowed,
    defaults,
    mandatory,
    stored
  ])

  const setVisibleKeys = useCallback((keys: string[]) => {
    const next = keys.filter((key): key is K => allowed.has(key))
    setStored(Array.from(new Set([...mandatory, ...next])))
  }, [
    allowed,
    mandatory,
    setStored
  ])

  const reset = useCallback(() => {
    setStored([...defaults])
  }, [
    defaults,
    setStored
  ])

  return {
    visibleKeys,
    setVisibleKeys,
    reset
  }
}
