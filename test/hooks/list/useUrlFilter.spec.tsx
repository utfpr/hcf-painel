import {
  describe,
  expect,
  test
} from 'vitest'

import { useUrlFilter } from '@/hooks/list/useUrlFilter'
import { act, renderHook } from '@testing-library/react'

import { SearchParamsWrapper } from './routerWrapper'

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <SearchParamsWrapper initialEntry="/usuarios?q=ana&role=1">
      {children}
    </SearchParamsWrapper>
  )
}

const defaults = {
  q: '',
  role: ''
}

describe('useUrlFilter', () => {
  test('hydrates values from the URL and omits defaults on set', () => {
    const { result } = renderHook(
      () => useUrlFilter({ defaults }),
      { wrapper }
    )

    expect(result.current.values).toEqual({
      q: 'ana',
      role: '1'
    })

    act(() => {
      result.current.set({ q: '' })
    })

    expect(result.current.values.q).toBe('')
  })

  test('clear of some keys leaves the others', () => {
    const { result } = renderHook(
      () => useUrlFilter({ defaults }),
      { wrapper }
    )

    act(() => {
      result.current.clear(['q'])
    })

    expect(result.current.values.q).toBe('')
    expect(result.current.values.role).toBe('1')
  })
})
