import {
  beforeEach,
  describe,
  expect,
  test,
  vi
} from 'vitest'

import { useListaFasesSucessionaisPage } from '@/features/fases-sucessionais/useListaFasesSucessionaisPage'
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

describe('FaseSucessional mutations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    httpClient.get.mockResolvedValue({ data: [] })
  })

  test('creates a stage through the v1 endpoint', async () => {
    httpClient.post.mockResolvedValue({ status: 201 })
    const { result } = renderHook(() => useListaFasesSucessionaisPage())

    await act(async () => {
      await result.current.create('Fase inicial')
    })

    expect(httpClient.post).toHaveBeenCalledWith(
      '/v1/fases-sucessionais',
      { nome: 'Fase inicial' }
    )
  })

  test('renames a stage by its ID through the v1 endpoint', async () => {
    httpClient.put.mockResolvedValue({ status: 200 })
    const { result } = renderHook(() => useListaFasesSucessionaisPage())

    await act(async () => {
      await result.current.update(17, 'Fase madura')
    })

    expect(httpClient.put).toHaveBeenCalledWith(
      '/v1/fases-sucessionais/17',
      { nome: 'Fase madura' }
    )
  })

  test('deletes a stage by its ID through the v1 endpoint', async () => {
    httpClient.delete.mockResolvedValue({ status: 204 })
    const { result } = renderHook(() => useListaFasesSucessionaisPage())

    await act(async () => {
      await result.current.remove(17)
    })

    expect(httpClient.delete).toHaveBeenCalledWith('/v1/fases-sucessionais/17')
  })
})
