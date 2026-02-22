import React from 'react'

import { ContainerProvider } from '@/contexts/Container/ContainerProvider'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { renderHook, act } from '@testing-library/react'

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ContainerProvider baseUrl="https://api.example.com">
      {children}
    </ContainerProvider>
  )
}

describe('useLocalStorage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('returns initial value when key exists', () => {
    window.localStorage.setItem('test-key', JSON.stringify('stored-value'))

    const { result } = renderHook(() => useLocalStorage<string>('test-key'), { wrapper })

    expect(result.current[0]).toBe('stored-value')
  })

  it('returns initialValue when key does not exist', () => {
    const { result } = renderHook(
      () => useLocalStorage<string>('missing-key', 'default'),
      { wrapper }
    )

    expect(result.current[0]).toBe('default')
  })

  it('returns undefined when key does not exist and no initialValue', () => {
    const { result } = renderHook(() => useLocalStorage<string>('missing-key'), { wrapper })

    expect(result.current[0]).toBeUndefined()
  })

  it('setValue updates localStorage and state', () => {
    const { result } = renderHook(() => useLocalStorage<string>('test-key'), { wrapper })
    const [, setValue] = result.current

    act(() => {
      setValue('new-value')
    })

    expect(window.localStorage.getItem('test-key')).toBe(JSON.stringify('new-value'))
    expect(result.current[0]).toBe('new-value')
  })

  it('setValue with object stores JSON', () => {
    const { result } = renderHook(() => useLocalStorage<{ id: number }>('obj-key'), {
      wrapper
    })
    const [, setValue] = result.current

    act(() => {
      setValue({ id: 42 })
    })

    expect(window.localStorage.getItem('obj-key')).toBe(JSON.stringify({ id: 42 }))
    expect(result.current[0]).toEqual({ id: 42 })
  })

  it('setValue undefined removes from localStorage', () => {
    window.localStorage.setItem('test-key', JSON.stringify('value'))
    const { result } = renderHook(() => useLocalStorage<string>('test-key'), { wrapper })
    const [, setValue] = result.current

    act(() => {
      setValue(undefined as unknown as string)
    })

    expect(window.localStorage.getItem('test-key')).toBeNull()
    expect(result.current[0]).toBeUndefined()
  })

  it('removeValue clears localStorage and state', () => {
    window.localStorage.setItem('test-key', JSON.stringify('value'))
    const { result } = renderHook(() => useLocalStorage<string>('test-key'), { wrapper })
    const [, , removeValue] = result.current

    act(() => {
      removeValue()
    })

    expect(window.localStorage.getItem('test-key')).toBeNull()
    expect(result.current[0]).toBeUndefined()
  })

  it('returns tuple with [value, setValue, removeValue]', () => {
    const { result } = renderHook(() => useLocalStorage<string>('test'), { wrapper })

    expect(result.current).toHaveLength(3)
    expect(typeof result.current[1]).toBe('function')
    expect(typeof result.current[2]).toBe('function')
  })
})
