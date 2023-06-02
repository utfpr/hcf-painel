import { useCallback, useState } from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AsyncFn = (...args: any[]) => Promise<unknown>

function useAsync<T extends AsyncFn>(callback: T): [boolean, T] {
  const [loading, setLoading] = useState(false)

  const func = useCallback(async (...args: Parameters<T>) => {
    try {
      setLoading(true)
      const result = await callback(...args)
      return result
    } finally {
      setLoading(false)
    }
  }, [])

  return [loading, func as unknown as T]
}

export default useAsync
