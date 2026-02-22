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
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetCookie.mockReturnValue(undefined)
  })

  it('returns initial value from getCookie', () => {
    mockGetCookie.mockReturnValue('initial-token')

    const { result } = renderHook(() => useCookie('access_token'), { wrapper })

    expect(result.current[0]).toBe('initial-token')
    expect(mockGetCookie).toHaveBeenCalledWith('access_token')
  })

  it('returns undefined when cookie does not exist', () => {
    mockGetCookie.mockReturnValue(undefined)

    const { result } = renderHook(() => useCookie('access_token'), { wrapper })

    expect(result.current[0]).toBeUndefined()
  })

  it('setValue calls setCookie and updates state', () => {
    const { result } = renderHook(() => useCookie('access_token'), { wrapper })
    const [, setValue] = result.current

    mockGetCookie.mockReturnValue('new-token')

    act(() => {
      setValue('new-token')
    })

    expect(mockSetCookie).toHaveBeenCalledWith('access_token', 'new-token', undefined)
    expect(result.current[0]).toBe('new-token')
  })

  it('setValue accepts options', () => {
    const { result } = renderHook(() => useCookie('access_token'), { wrapper })
    const [, setValue] = result.current

    act(() => {
      setValue('new-token', { path: '/', maxAge: 3600 })
    })

    expect(mockSetCookie).toHaveBeenCalledWith('access_token', 'new-token', {
      path: '/',
      maxAge: 3600
    })
  })

  it('removeValue calls removeCookie and clears state', () => {
    mockGetCookie.mockReturnValue('existing-token')
    const { result } = renderHook(() => useCookie('access_token'), { wrapper })
    const [, , removeValue] = result.current

    act(() => {
      removeValue()
    })

    expect(mockRemoveCookie).toHaveBeenCalledWith('access_token')
    expect(result.current[0]).toBeUndefined()
  })

  it('returns tuple with [value, setValue, removeValue]', () => {
    const { result } = renderHook(() => useCookie('test'), { wrapper })

    expect(result.current).toHaveLength(3)
    expect(typeof result.current[1]).toBe('function')
    expect(typeof result.current[2]).toBe('function')
  })
})
