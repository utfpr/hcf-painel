/* eslint-disable @typescript-eslint/no-explicit-any */
import useSWR from 'swr'

interface UseQueryOptions {
  keepPreviousData: boolean
}

export interface UseQueryReturn<F extends (...args: any) => any> {
  data?: Awaited<ReturnType<F>> | undefined
  error?: Error | undefined
  loading: boolean
  validating: boolean
  refresh: () => Promise<Awaited<ReturnType<F>> | undefined>
}

export function useQuery<F extends(...args: any) => any>(
  fetcher: F,
  deps: readonly any[] | null,
  options?: UseQueryOptions
): UseQueryReturn<F> {
  const {
    data, error, isLoading,
    isValidating, mutate
  } = useSWR<Awaited<ReturnType<F>>, Error>(deps, fetcher, options)

  return {
    data,
    error,
    loading: isLoading,
    validating: isValidating,
    refresh: () => mutate()
  }
}
