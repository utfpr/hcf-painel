import { useCallback, useMemo } from 'react'

import { useLocalStorage } from '@/hooks/useLocalStorage'

import {
  DEFAULT_USER_COLUMNS,
  USER_COLUMN_KEYS,
  type UserColumnKey
} from '../types'

const STORAGE_KEY = 'hcf.users.columns'

function isColumnKey(value: unknown): value is UserColumnKey {
  return typeof value === 'string' && USER_COLUMN_KEYS.includes(value as UserColumnKey)
}

export function useColumnVisibility() {
  const [stored, setStored] = useLocalStorage<UserColumnKey[]>(
    STORAGE_KEY,
    DEFAULT_USER_COLUMNS
  )

  const visibleKeys = useMemo(() => {
    const keys = (stored ?? DEFAULT_USER_COLUMNS).filter(isColumnKey)
    const unique = Array.from(new Set(['nome' as const, ...keys]))
    return unique.filter(isColumnKey)
  }, [stored])

  const setVisibleKeys = useCallback((keys: string[]) => {
    const next = keys.filter(isColumnKey)
    if (!next.includes('nome')) next.unshift('nome')
    setStored(Array.from(new Set(next)))
  }, [setStored])

  const reset = useCallback(() => {
    setStored([...DEFAULT_USER_COLUMNS])
  }, [setStored])

  return {
    visibleKeys,
    setVisibleKeys,
    reset,
    isVisible: (key: UserColumnKey) => visibleKeys.includes(key)
  }
}
