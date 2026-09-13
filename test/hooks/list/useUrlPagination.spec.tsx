import {
  describe,
  expect,
  test
} from 'vitest'

import { useUrlPagination } from '@/hooks/list/useUrlPagination'
import { act, renderHook } from '@testing-library/react'

import { SearchParamsWrapper } from './routerWrapper'

describe('useUrlPagination', () => {
  test('omits page 1 and default page size from the URL', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SearchParamsWrapper>{children}</SearchParamsWrapper>
    )

    const { result } = renderHook(() => useUrlPagination(), { wrapper })

    expect(result.current.page).toBe(1)
    expect(result.current.pageSize).toBe(20)

    act(() => {
      result.current.setPage(3)
    })
    expect(result.current.page).toBe(3)

    act(() => {
      result.current.setPage(1)
    })
    expect(result.current.page).toBe(1)
  })

  test('changing page size resets to page 1', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SearchParamsWrapper initialEntry="/usuarios?page=4">{children}</SearchParamsWrapper>
    )

    const { result } = renderHook(() => useUrlPagination(), { wrapper })
    expect(result.current.page).toBe(4)

    act(() => {
      result.current.setPageSize(50)
    })

    expect(result.current.page).toBe(1)
    expect(result.current.pageSize).toBe(50)
  })

  test('invalid values fall back to defaults', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SearchParamsWrapper initialEntry="/usuarios?page=abc&pageSize=7">
        {children}
      </SearchParamsWrapper>
    )

    const { result } = renderHook(() => useUrlPagination(), { wrapper })
    expect(result.current.page).toBe(1)
    expect(result.current.pageSize).toBe(20)
  })
})
