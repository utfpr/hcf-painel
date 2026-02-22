import React from 'react'

import { ContainerProvider } from '@/contexts/Container/ContainerProvider'
import { getCookie, removeCookie, setCookie } from '@/helpers/cookie'
import { useCookie } from '@/hooks/useCookie'
import { renderHook, act } from '@testing-library/react'

jest.mock('@/helpers/cookie', () => ({
  getCookie: jest.fn(),
  setCookie: jest.fn(),
  removeCookie: jest.fn()
}))

const mockGetCookie = getCookie as jest.Mock
const mockSetCookie = setCookie as jest.Mock
const mockRemoveCookie = removeCookie as jest.Mock

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ContainerProvider baseUrl="https://api.example.com">
      {children}
    </ContainerProvider>
  )
}

describe('useCookie', () => {
  it('returns initial value from getCookie', () => {
    // arrange
    mockGetCookie.mockReturnValue('initial-token')

    // act
    const { result } = renderHook(() => useCookie('access_token'), { wrapper })

    // assert
    expect(result.current[0]).toBe('initial-token')
    expect(mockGetCookie).toHaveBeenCalledWith('access_token')
  })

  it('returns undefined when cookie does not exist', () => {
    // arrange
    mockGetCookie.mockReturnValue(undefined)

    // act
    const { result } = renderHook(() => useCookie('access_token'), { wrapper })

    // assert
    expect(result.current[0]).toBeUndefined()
  })

  it('setValue calls setCookie and updates state', () => {
    // arrange
    mockGetCookie.mockReturnValue('new-token')
    const { result } = renderHook(() => useCookie('access_token'), { wrapper })
    const [, setValue] = result.current

    // act
    act(() => {
      setValue('new-token')
    })

    // assert
    expect(mockSetCookie).toHaveBeenCalledWith('access_token', 'new-token', undefined)
    expect(result.current[0]).toBe('new-token')
  })

  it('setValue accepts options', () => {
    // arrange
    mockGetCookie.mockReturnValue(undefined)
    const { result } = renderHook(() => useCookie('access_token'), { wrapper })
    const [, setValue] = result.current

    // act
    act(() => {
      setValue('new-token', { path: '/', maxAge: 3600 })
    })

    // assert
    expect(mockSetCookie).toHaveBeenCalledWith('access_token', 'new-token', {
      path: '/',
      maxAge: 3600
    })
  })

  it('removeValue calls removeCookie and clears state', () => {
    // arrange
    mockGetCookie.mockReturnValue('existing-token')
    const { result } = renderHook(() => useCookie('access_token'), { wrapper })
    const [, , removeValue] = result.current

    // act
    act(() => {
      removeValue()
    })

    // assert
    expect(mockRemoveCookie).toHaveBeenCalledWith('access_token')
    expect(result.current[0]).toBeUndefined()
  })

  it('returns tuple with [value, setValue, removeValue]', () => {
    // arrange
    mockGetCookie.mockReturnValue(undefined)

    // act
    const { result } = renderHook(() => useCookie('test'), { wrapper })

    // assert
    expect(result.current).toHaveLength(3)
    expect(typeof result.current[1]).toBe('function')
    expect(typeof result.current[2]).toBe('function')
  })
})
