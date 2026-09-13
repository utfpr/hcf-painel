/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
import { useCallback } from 'react'

import { mutate } from 'swr'
import useSWRMutation from 'swr/mutation'

interface UseMutationOptions {
  throwOnError?: boolean
  revalidate?: readonly (readonly unknown[])[]
}

export interface UseMutationReturn<F extends (...args: any[]) => any> {
  data?: Awaited<ReturnType<F>>
  error?: Error
  loading: boolean
  trigger: (...args: Parameters<F>) => Promise<Awaited<ReturnType<F>> | undefined>
  reset: () => void
}

function matchesPrefix(queryKey: unknown, prefix: readonly unknown[]): boolean {
  if (!Array.isArray(queryKey)) return false
  return prefix.every((part, i) => queryKey[i] === part)
}

async function revalidateQueries(
  prefixes: readonly (readonly unknown[])[]
): Promise<void> {
  await mutate(
    key => prefixes.some(prefix => matchesPrefix(key, prefix)),
    undefined,
    { revalidate: true }
  )
}

export function useMutation<F extends (...args: any[]) => any>(
  mutator: F,
  deps: readonly any[] | null,
  options?: UseMutationOptions
): UseMutationReturn<F> {
  const throwOnError = options?.throwOnError ?? true
  const revalidate = options?.revalidate

  const {
    data,
    error,
    isMutating,
    trigger: swrTrigger,
    reset
  } = useSWRMutation<
    Awaited<ReturnType<F>>,
    Error,
    readonly any[] | null,
    any[]
  >(
    deps,
    (_key, { arg }) => mutator(...arg),
    { throwOnError }
  )

  const trigger = useCallback(
    async (...args: Parameters<F>) => {
      if (deps === null) return undefined

      try {
        const result = await swrTrigger(args, { throwOnError: true })
        if (revalidate?.length) {
          await revalidateQueries(revalidate)
        }
        return result
      } catch (err) {
        if (throwOnError) throw err
        return undefined
      }
    },
    [
      deps,
      revalidate,
      swrTrigger,
      throwOnError
    ]
  )

  return {
    data,
    error,
    loading: isMutating,
    trigger,
    reset
  }
}
