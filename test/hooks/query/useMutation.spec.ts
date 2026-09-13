import {
  describe,
  expect,
  test,
  vi
} from 'vitest'

import { useMutation } from '@/hooks/query/useMutation'
import { useQuery } from '@/hooks/query/useQuery'
import {
  act, renderHook, waitFor
} from '@testing-library/react'

describe('useMutation', () => {
  test('does not call mutator on mount', () => {
    const mutator = vi.fn().mockResolvedValue('ok')

    const { result } = renderHook(() => useMutation(mutator, ['no-mount-key']))

    expect(mutator).not.toHaveBeenCalled()
    expect(result.current.loading).toBe(false)
    expect(result.current.data).toBeUndefined()
    expect(result.current.error).toBeUndefined()
  })

  test('sets loading while trigger is pending', async () => {
    let resolve!: (value: string) => void
    const mutator = vi.fn(
      () => new Promise<string>(res => {
        resolve = res
      })
    )

    const { result } = renderHook(() => useMutation(mutator, ['pending-key']))

    let pending: Promise<string | undefined>
    act(() => {
      pending = result.current.trigger()
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(true)
    })

    await act(async () => {
      resolve('done')
      await pending
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.data).toBe('done')
  })

  test('returns data when mutator resolves', async () => {
    const mockData = { id: 1 }
    const mutator = vi.fn().mockResolvedValue(mockData)

    const { result } = renderHook(() => useMutation(mutator, ['success-key']))

    await act(async () => {
      const data = await result.current.trigger({ name: 'a' })
      expect(data).toEqual(mockData)
    })

    expect(result.current.data).toEqual(mockData)
    expect(result.current.error).toBeUndefined()
    expect(mutator).toHaveBeenCalledWith({ name: 'a' })
    expect(mutator).not.toHaveBeenCalledWith(['success-key'])
  })

  test('forwards multiple trigger arguments to mutator', async () => {
    const mutator = vi.fn().mockResolvedValue('ok')

    const { result } = renderHook(() => useMutation(mutator, ['multi-arg-key']))

    await act(async () => {
      await result.current.trigger(1, 'two')
    })

    expect(mutator).toHaveBeenCalledWith(1, 'two')
  })

  test('rejects and sets error when mutator fails', async () => {
    const mockError = new Error('Mutation failed')
    const mutator = vi.fn().mockRejectedValue(mockError)

    const { result } = renderHook(() => useMutation(mutator, ['error-key']))

    await act(async () => {
      await expect(result.current.trigger()).rejects.toThrow(mockError)
    })

    expect(result.current.error).toEqual(mockError)
  })

  test('resolves undefined when throwOnError is false', async () => {
    const mockError = new Error('Mutation failed')
    const mutator = vi.fn().mockRejectedValue(mockError)

    const { result } = renderHook(() => useMutation(
      mutator,
      ['no-throw-key'],
      { throwOnError: false }
    ))

    await act(async () => {
      await expect(result.current.trigger()).resolves.toBeUndefined()
    })

    expect(result.current.error).toEqual(mockError)
  })

  test('does not call mutator when deps is null', async () => {
    const mutator = vi.fn()

    const { result } = renderHook(() => useMutation(mutator, null))

    await act(async () => {
      await expect(result.current.trigger()).resolves.toBeUndefined()
    })

    expect(mutator).not.toHaveBeenCalled()
    expect(result.current.loading).toBe(false)
  })

  test('clears data and error on reset', async () => {
    const mutator = vi.fn().mockResolvedValue('ok')

    const { result } = renderHook(() => useMutation(mutator, ['reset-key']))

    await act(async () => {
      await result.current.trigger()
    })

    expect(result.current.data).toBe('ok')

    act(() => {
      result.current.reset()
    })

    expect(result.current.data).toBeUndefined()
    expect(result.current.error).toBeUndefined()
  })

  test('revalidates matching useQuery keys after success', async () => {
    const listFetcher = vi.fn().mockResolvedValue({ items: 1 })
    const otherFetcher = vi.fn().mockResolvedValue({ items: 2 })
    const mutator = vi.fn().mockResolvedValue({ status: 201 })

    const { result } = renderHook(() => ({
      list: useQuery(listFetcher, [
        'revalidate-users',
        { q: '' },
        1
      ]),
      other: useQuery(otherFetcher, ['revalidate-other', 1]),
      mutation: useMutation(
        mutator,
        ['revalidate-users', 'create'],
        { revalidate: [['revalidate-users']] }
      )
    }))

    await waitFor(() => {
      expect(result.current.list.loading).toBe(false)
      expect(result.current.other.loading).toBe(false)
    })

    const listCalls = listFetcher.mock.calls.length
    const otherCalls = otherFetcher.mock.calls.length

    await act(async () => {
      await result.current.mutation.trigger({ nome: 'a' })
    })

    await waitFor(() => {
      expect(listFetcher.mock.calls.length).toBeGreaterThan(listCalls)
    })

    expect(otherFetcher.mock.calls.length).toBe(otherCalls)
  })

  test('does not revalidate when trigger fails', async () => {
    const listFetcher = vi.fn().mockResolvedValue({ items: 1 })
    const mutator = vi.fn().mockRejectedValue(new Error('fail'))

    const { result } = renderHook(() => ({
      list: useQuery(listFetcher, ['revalidate-fail-users', 1]),
      mutation: useMutation(
        mutator,
        ['revalidate-fail-users', 'create'],
        { revalidate: [['revalidate-fail-users']] }
      )
    }))

    await waitFor(() => {
      expect(result.current.list.loading).toBe(false)
    })

    const listCalls = listFetcher.mock.calls.length

    await act(async () => {
      await expect(result.current.mutation.trigger()).rejects.toThrow('fail')
    })

    expect(listFetcher.mock.calls.length).toBe(listCalls)
  })
})
