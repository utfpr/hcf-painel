import { useQuery } from '@/hooks/query/useQuery'
import { renderHook, waitFor } from '@testing-library/react'

describe('useQuery', () => {
  it('returns loading true initially', () => {
    // arrange
    const fetcher = jest.fn().mockResolvedValue({ data: 'result' })

    // act
    const { result } = renderHook(() => useQuery(fetcher, ['loading-test-key']))

    // assert
    expect(result.current.loading).toBe(true)
    expect(result.current.validating).toBe(true)
    expect(result.current.data).toBeUndefined()
    expect(result.current.error).toBeUndefined()
  })

  it('returns data when fetcher resolves', async () => {
    // arrange
    const mockData = { id: 1, name: 'test' }
    const fetcher = jest.fn().mockResolvedValue(mockData)

    // act
    const { result } = renderHook(() => useQuery(fetcher, ['data-test-key']))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // assert
    expect(result.current.data).toEqual(mockData)
    expect(result.current.error).toBeUndefined()
    expect(fetcher).toHaveBeenCalledWith(['data-test-key'])
  })

  it('returns error when fetcher rejects', async () => {
    // arrange
    const mockError = new Error('Fetch failed')
    const fetcher = jest.fn().mockRejectedValue(mockError)

    // act
    const { result } = renderHook(() => useQuery(fetcher, ['error-test-key']))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // assert
    expect(result.current.error).toEqual(mockError)
    expect(result.current.data).toBeUndefined()
  })

  it('passes deps to fetcher', async () => {
    // arrange
    const fetcher = jest.fn().mockResolvedValue('ok')

    // act
    renderHook(() => useQuery(fetcher, ['deps-test-key']))

    // assert
    await waitFor(() => {
      expect(fetcher).toHaveBeenCalledWith(['deps-test-key'])
    })
  })

  it('supports null deps to disable fetch', () => {
    // arrange
    const fetcher = jest.fn()

    // act
    const { result } = renderHook(() => useQuery(fetcher, null))

    // assert
    expect(fetcher).not.toHaveBeenCalled()
    expect(result.current.loading).toBe(false)
  })
})
