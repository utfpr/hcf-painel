import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { useListaRelevosPage } from '@/features/relevos/useListaRelevosPage'

const { get } = vi.hoisted(() => ({ get: vi.fn() }))

vi.mock('@/contexts/Container/useContainer', () => ({
  useContainer: () => ({ httpClient: { get }, broker: {} })
}))

describe('useListaRelevosPage', () => {
  test('fetches updated pagination and sorting parameters', async () => {
    get.mockResolvedValue({
      data: {
        relevos: [{ id: 7, nome: 'Relevo montanhoso' }],
        metadados: { total: 3, pagina: 1, limite: 20 }
      }
    })

    const { result } = renderHook(() => useListaRelevosPage())

    await waitFor(() => expect(get).toHaveBeenCalled())

    act(() => result.current.changePage(2, 50, { field: 'nome', order: 'descend' }))

    await waitFor(() => {
      expect(get).toHaveBeenLastCalledWith('/v1/relevos', {
        pagina: 2,
        limite: 50,
        order: 'nome:desc'
      })
    })
  })
})
