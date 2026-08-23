import { type Mock, vi } from 'vitest'

import { getCookie } from '@/helpers/cookie'
import { CookieAccessTokenSource } from '@/libraries/session/CookieAccessTokenSource'

vi.mock('@/helpers/cookie', () => ({
  getCookie: vi.fn()
}))

const mockGetCookie = getCookie as Mock

describe('CookieAccessTokenSource', () => {
  beforeEach(() => {
    mockGetCookie.mockReset()
  })

  it('returns the Access_Token cookie value', () => {
    mockGetCookie.mockReturnValue('session-token')

    const source = new CookieAccessTokenSource()

    expect(source.getAccessToken()).toBe('session-token')
    expect(mockGetCookie).toHaveBeenCalledWith('Access_Token')
  })

  it('returns undefined when the cookie is missing', () => {
    mockGetCookie.mockReturnValue(undefined)

    const source = new CookieAccessTokenSource()

    expect(source.getAccessToken()).toBeUndefined()
  })

  it('reads a custom cookie name', () => {
    mockGetCookie.mockReturnValue('other-token')

    const source = new CookieAccessTokenSource('Other_Token')

    expect(source.getAccessToken()).toBe('other-token')
    expect(mockGetCookie).toHaveBeenCalledWith('Other_Token')
  })
})
