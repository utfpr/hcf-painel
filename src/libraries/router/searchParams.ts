import {
  useCallback, useMemo, useRef
} from 'react'

import { useSearchParams } from 'react-router'

export interface SearchParamsStore {
  params: URLSearchParams
  /** Read current params, apply updates, one navigate `replace: true`. `null` deletes the key. */
  patch: (updates: Record<string, string | null>) => void
}

export function useSearchParamsStore(): SearchParamsStore {
  const [params, setParams] = useSearchParams()
  const paramsRef = useRef(params)
  paramsRef.current = params

  const patch = useCallback((updates: Record<string, string | null>) => {
    const next = new URLSearchParams(paramsRef.current)
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === '') next.delete(key)
      else next.set(key, value)
    }
    paramsRef.current = next
    setParams(next, { replace: true })
  }, [setParams])

  return useMemo(() => ({
    params,
    patch
  }), [
    params,
    patch
  ])
}
