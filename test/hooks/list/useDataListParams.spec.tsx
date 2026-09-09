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

describe('useDataListParams', () => {
  test('setQuery clears page in the same patch', () => {
    const { result } = renderHook(
      () => useDataListParams({
        storageKey: 'hcf.users.columns.test',
        defaults: {
          q: '',
          role: '',
          sort: '',
          order: ''
        },
        allowedSortKeys: ['nome'],
        columnKeys: ['nome', 'email'],
        mandatoryColumnKeys: ['nome']
      }),
      { wrapper }
    )

    expect(result.current.query.q).toBe('ana')
    expect(result.current.page).toBe(3)

    act(() => {
      result.current.setQuery({ q: 'bia' })
    })

    expect(result.current.query.q).toBe('bia')
    expect(result.current.page).toBe(1)
  })

  test('applyTableChange resets page when sort changes', () => {
    const { result } = renderHook(
      () => useDataListParams({
        storageKey: 'hcf.users.columns.test',
        defaults: {
          q: '',
          role: '',
          sort: '',
          order: ''
        },
        allowedSortKeys: ['nome'],
        columnKeys: ['nome'],
        mandatoryColumnKeys: ['nome']
      }),
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
      () => useDataListParams({
        storageKey: 'hcf.users.columns.test',
        defaults: {
          q: '',
          role: '',
          sort: '',
          order: ''
        },
        allowedSortKeys: ['nome'],
        columnKeys: ['nome'],
        mandatoryColumnKeys: ['nome']
      }),
      { wrapper: sortWrapper }
    )

    expect(result.current.sort).toEqual({
      key: 'nome',
      order: 'desc'
    })
    expect(result.current.hasActiveFilters).toBe(false)
  })
})
