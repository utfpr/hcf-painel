/* eslint-disable @typescript-eslint/no-explicit-any */
import useSWR, { type SWRConfiguration } from 'swr'

export interface UseQueryReturn<F extends (...args: any) => any> {
    data?: Awaited<ReturnType<F>> | undefined
    error?: Error | undefined
    loading: boolean
    validating: boolean
}

export function useQuery<F extends(
    ...args: any) => any>(
    fetcher: F,
    deps: readonly any[] | null,
    options?: SWRConfiguration
): UseQueryReturn<F> {
    const {
        data, error, isLoading, isValidating
    } = useSWR<Awaited<ReturnType<F>>, Error>(deps, fetcher, options)

    return {
        data,
        error,
        loading: isLoading,
        validating: isValidating
    }
}
