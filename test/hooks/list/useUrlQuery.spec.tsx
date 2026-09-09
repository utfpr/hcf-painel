import {
  describe,
  expect,
  test
} from 'vitest'

import { useUrlQuery } from '@/hooks/list/useUrlQuery'
import { act, renderHook } from '@testing-library/react'

import { SearchParamsWrapper } from './routerWrapper'

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <SearchParamsWrapper initialEntry="/usuarios?q=ana&sort=nome&order=asc">
      {children}
    </SearchParamsWrapper>
  )
}

const defaults = {
  q: '',
  role: '',
  sort: '',
  order: ''
}

describe('useUrlQuery', () => {
  test('hydrates values from the URL and omits defaults on set', () => {
    const { result } = renderHook(
      () => useUrlQuery({
        defaults,
        allowedSortKeys: ['nome', 'tipo']
      }),
      { wrapper }
    )

    expect(result.current.values).toEqual({
      q: 'ana',
      role: '',
      sort: 'nome',
      order: 'asc'
    })

    act(() => {
      result.current.set({ q: '' })
    })

    expect(result.current.values.q).toBe('')
  })

  test('treats unknown sort keys as the default pair', () => {
    const unknownSortWrapper = ({ children }: { children: React.ReactNode }) => (
      <SearchParamsWrapper initialEntry="/usuarios?sort=injected&order=asc">
        {children}
      </SearchParamsWrapper>
    )

    const { result } = renderHook(
      () => useUrlQuery({
        defaults,
        allowedSortKeys: ['nome']
      }),
      { wrapper: unknownSortWrapper }
    )

    expect(result.current.values.sort).toBe('')
    expect(result.current.values.order).toBe('')
  })

  test('clear of filter keys does not wipe sort', () => {
    const { result } = renderHook(
      () => useUrlQuery({
        defaults,
        allowedSortKeys: ['nome']
      }),
      { wrapper }
    )

    act(() => {
      result.current.clear(['q', 'role'])
    })

    expect(result.current.values.q).toBe('')
    expect(result.current.values.sort).toBe('nome')
    expect(result.current.values.order).toBe('asc')
  })
})
