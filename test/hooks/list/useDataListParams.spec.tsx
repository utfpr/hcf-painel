import React from 'react'

import {
  describe,
  expect,
  test
} from 'vitest'

import { ContainerProvider } from '@/contexts/Container/ContainerProvider'
import { useDataListParams } from '@/hooks/list/useDataListParams'
import { act, renderHook } from '@testing-library/react'

import { SearchParamsWrapper } from './routerWrapper'

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ContainerProvider baseUrl="https://api.example.com">
      <SearchParamsWrapper initialEntry="/usuarios?q=ana&page=3">
        {children}
      </SearchParamsWrapper>
    </ContainerProvider>
  )
}

const listOptions = {
  storageKey: 'hcf.users.columns.test',
  defaults: {
    q: '',
    role: ''
  },
  allowedSortKeys: ['nome'] as const,
  columnKeys: ['nome', 'email'],
  mandatoryColumnKeys: ['nome'] as const
}

describe('useDataListParams', () => {
  test('setFilter clears page in the same patch', () => {
    const { result } = renderHook(
      () => useDataListParams(listOptions),
      { wrapper }
    )

    expect(result.current.filter.q).toBe('ana')
    expect(result.current.page).toBe(3)

    act(() => {
      result.current.setFilter({ q: 'bia' })
    })

    expect(result.current.filter.q).toBe('bia')
    expect(result.current.page).toBe(1)
  })

  test('applyTableChange resets page when sort changes', () => {
    const { result } = renderHook(
      () => useDataListParams(listOptions),
      { wrapper }
    )

    act(() => {
      result.current.applyTableChange({
        page: 3,
        pageSize: 20,
        sort: {
          key: 'nome',
          order: 'asc'
        }
      })
    })

    expect(result.current.sort).toEqual({
      key: 'nome',
      order: 'asc'
    })
    expect(result.current.page).toBe(1)
  })

  test('hasActiveFilters ignores sort', () => {
    const sortWrapper = ({ children }: { children: React.ReactNode }) => (
      <ContainerProvider baseUrl="https://api.example.com">
        <SearchParamsWrapper initialEntry="/usuarios?sort=nome&order=desc">
          {children}
        </SearchParamsWrapper>
      </ContainerProvider>
    )

    const { result } = renderHook(
      () => useDataListParams(listOptions),
      { wrapper: sortWrapper }
    )

    expect(result.current.sort).toEqual({
      key: 'nome',
      order: 'desc'
    })
    expect(result.current.hasActiveFilters).toBe(false)
  })

  test('unknown sort keys are ignored', () => {
    const unknownSortWrapper = ({ children }: { children: React.ReactNode }) => (
      <ContainerProvider baseUrl="https://api.example.com">
        <SearchParamsWrapper initialEntry="/usuarios?sort=injected&order=asc">
          {children}
        </SearchParamsWrapper>
      </ContainerProvider>
    )

    const { result } = renderHook(
      () => useDataListParams(listOptions),
      { wrapper: unknownSortWrapper }
    )

    expect(result.current.sort).toBeNull()
  })
})
