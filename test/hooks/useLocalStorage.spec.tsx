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
  it('returns initial value when key exists', () => {
    // arrange
    window.localStorage.clear()
    window.localStorage.setItem('test-key', JSON.stringify('stored-value'))

    // act
    const { result } = renderHook(() => useLocalStorage<string>('test-key'), { wrapper })

    // assert
    expect(result.current[0]).toBe('stored-value')
  })

  it('returns initialValue when key does not exist', () => {
    // arrange
    window.localStorage.clear()

    // act
    const { result } = renderHook(
      () => useLocalStorage<string>('missing-key', 'default'),
      { wrapper }
    )

    // assert
    expect(result.current[0]).toBe('default')
  })

  it('returns undefined when key does not exist and no initialValue', () => {
    // arrange
    window.localStorage.clear()

    // act
    const { result } = renderHook(() => useLocalStorage<string>('missing-key'), { wrapper })

    // assert
    expect(result.current[0]).toBeUndefined()
  })

  it('setValue updates localStorage and state', () => {
    // arrange
    window.localStorage.clear()
    const { result } = renderHook(() => useLocalStorage<string>('test-key'), { wrapper })
    const [, setValue] = result.current

    // act
    act(() => {
      setValue('new-value')
    })

    // assert
    expect(window.localStorage.getItem('test-key')).toBe(JSON.stringify('new-value'))
    expect(result.current[0]).toBe('new-value')
  })

  it('setValue with object stores JSON', () => {
    // arrange
    window.localStorage.clear()
    const { result } = renderHook(() => useLocalStorage<{ id: number }>('obj-key'), {
      wrapper
    })
    const [, setValue] = result.current

    // act
    act(() => {
      setValue({ id: 42 })
    })

    // assert
    expect(window.localStorage.getItem('obj-key')).toBe(JSON.stringify({ id: 42 }))
    expect(result.current[0]).toEqual({ id: 42 })
  })

  it('setValue undefined removes from localStorage', () => {
    // arrange
    window.localStorage.clear()
    window.localStorage.setItem('test-key', JSON.stringify('value'))
    const { result } = renderHook(() => useLocalStorage<string>('test-key'), { wrapper })
    const [, setValue] = result.current

    // act
    act(() => {
      setValue(undefined as unknown as string)
    })

    // assert
    expect(window.localStorage.getItem('test-key')).toBeNull()
    expect(result.current[0]).toBeUndefined()
  })

  it('removeValue clears localStorage and state', () => {
    // arrange
    window.localStorage.clear()
    window.localStorage.setItem('test-key', JSON.stringify('value'))
    const { result } = renderHook(() => useLocalStorage<string>('test-key'), { wrapper })
    const [, , removeValue] = result.current

    // act
    act(() => {
      removeValue()
    })

    // assert
    expect(window.localStorage.getItem('test-key')).toBeNull()
    expect(result.current[0]).toBeUndefined()
  })

  it('returns tuple with [value, setValue, removeValue]', () => {
    // arrange
    window.localStorage.clear()

    // act
    const { result } = renderHook(() => useLocalStorage<string>('test'), { wrapper })

    // assert
    expect(result.current).toHaveLength(3)
    expect(typeof result.current[1]).toBe('function')
    expect(typeof result.current[2]).toBe('function')
  })
})
