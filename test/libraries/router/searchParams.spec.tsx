import {
  MemoryRouter, Route, Routes, useLocation
} from 'react-router'
import {
  describe,
  expect,
  test
} from 'vitest'

import { useSearchParamsStore } from '@/libraries/router'
import { act, renderHook } from '@testing-library/react'

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter initialEntries={['/usuarios']}>
      <Routes>
        <Route path="/usuarios" element={children} />
      </Routes>
    </MemoryRouter>
  )
}

function useStoreAndSearch() {
  const store = useSearchParamsStore()
  const location = useLocation()
  return {
    store,
    search: location.search
  }
}

describe('useSearchParamsStore', () => {
  test('writes a key and omits empty values', () => {
    const { result } = renderHook(() => useStoreAndSearch(), { wrapper })

    act(() => {
      result.current.store.patch({ q: 'ana' })
    })

    expect(result.current.search).toBe('?q=ana')

    act(() => {
      result.current.store.patch({ q: null })
    })

    expect(result.current.search).toBe('')
  })

  test('applies two sequential patches in one turn without dropping keys', () => {
    const { result } = renderHook(() => useStoreAndSearch(), { wrapper })

    act(() => {
      result.current.store.patch({ q: 'ana' })
      result.current.store.patch({ role: '1' })
    })

    const params = new URLSearchParams(result.current.search)
    expect(params.get('q')).toBe('ana')
    expect(params.get('role')).toBe('1')
  })
})
