import { useQuery } from '@/hooks/query/useQuery'
import { renderHook, waitFor } from '@testing-library/react'

describe('useQuery', () => {
  it('returns loading true initially', () => {
    const fetcher = jest.fn().mockResolvedValue({ data: 'result' })

    const { result } = renderHook(() => useQuery(fetcher, ['loading-test-key']))

    expect(result.current.loading).toBe(true)
    expect(result.current.validating).toBe(true)
    expect(result.current.data).toBeUndefined()
    expect(result.current.error).toBeUndefined()
  })

  it('returns data when fetcher resolves', async () => {
    const mockData = { id: 1, name: 'test' }
    const fetcher = jest.fn().mockResolvedValue(mockData)

    const { result } = renderHook(() => useQuery(fetcher, ['data-test-key']))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual(mockData)
    expect(result.current.error).toBeUndefined()
    expect(fetcher).toHaveBeenCalledWith(['data-test-key'])
  })

  it('returns error when fetcher rejects', async () => {
    const mockError = new Error('Fetch failed')
    const fetcher = jest.fn().mockRejectedValue(mockError)

    const { result } = renderHook(() => useQuery(fetcher, ['error-test-key']))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toEqual(mockError)
    expect(result.current.data).toBeUndefined()
  })

  it('passes deps to fetcher', async () => {
    const fetcher = jest.fn().mockResolvedValue('ok')

    renderHook(() => useQuery(fetcher, ['deps-test-key']))

    await waitFor(() => {
      expect(fetcher).toHaveBeenCalledWith(['deps-test-key'])
    })
  })

  it('supports null deps to disable fetch', () => {
    const fetcher = jest.fn()

    const { result } = renderHook(() => useQuery(fetcher, null))

    expect(fetcher).not.toHaveBeenCalled()
    expect(result.current.loading).toBe(false)
  })
})
