import {
  beforeEach,
  describe,
  expect,
  test,
  vi
} from 'vitest'

import { useListaSolosPage } from '@/features/solos/useListaSolosPage'
import {
  act,
  renderHook
} from '@testing-library/react'

const { httpClient } = vi.hoisted(() => ({
  httpClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

vi.mock('@/contexts/Container/useContainer', () => ({
  useContainer: () => ({ httpClient })
}))

describe('Solo mutations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    httpClient.get.mockResolvedValue({ data: [] })
  })

  test('creates with the expected body when the API returns 201', async () => {
    httpClient.post.mockResolvedValue({ status: 201 })
    const { result } = renderHook(() => useListaSolosPage())

    await act(async () => {
      await result.current.create('Argiloso')
    })

    expect(httpClient.post).toHaveBeenCalledWith(
      '/v2/solos',
      { nome: 'Argiloso' }
    )
  })

  test.each([400, 409])('propagates create errors with status %s', async status => {
    const error = Object.assign(new Error('Request failed'), { response: { status } })
    httpClient.post.mockRejectedValue(error)
    const { result } = renderHook(() => useListaSolosPage())

    await act(async () => {
      await expect(result.current.create('Argiloso')).rejects.toBe(error)
    })
  })

  test('renames without changing the resource ID when the API returns 200', async () => {
    httpClient.put.mockResolvedValue({ status: 200 })
    const { result } = renderHook(() => useListaSolosPage())

    await act(async () => {
      await result.current.update(17, 'Arenoso')
    })

    expect(httpClient.put).toHaveBeenCalledWith(
      '/v2/solos/17',
      { nome: 'Arenoso' }
    )
  })

  test('deletes the resource when the API returns 204', async () => {
    httpClient.delete.mockResolvedValue({ status: 204 })
    const { result } = renderHook(() => useListaSolosPage())

    await act(async () => {
      await result.current.remove(17)
    })

    expect(httpClient.delete).toHaveBeenCalledWith('/v2/solos/17')
  })

  test('propagates delete conflicts', async () => {
    const error = Object.assign(new Error('Conflict'), { response: { status: 409 } })
    httpClient.delete.mockRejectedValue(error)
    const { result } = renderHook(() => useListaSolosPage())

    await act(async () => {
      await expect(result.current.remove(17)).rejects.toBe(error)
    })
  })
})
