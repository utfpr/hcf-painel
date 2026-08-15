import { type Mock, vi } from 'vitest'

import { getCookie } from '@/helpers/cookie'
import { CookieCredentials } from '@/libraries/session/CookieCredentials'

vi.mock('@/helpers/cookie', () => ({
  getCookie: vi.fn()
}))

const mockGetCookie = getCookie as Mock

describe('CookieCredentials', () => {
  beforeEach(() => {
    mockGetCookie.mockReset()
  })

  it('returns the Access_Token cookie value', () => {
    mockGetCookie.mockReturnValue('session-token')

    const credentials = new CookieCredentials()

    expect(credentials.getAccessToken()).toBe('session-token')
    expect(mockGetCookie).toHaveBeenCalledWith('Access_Token')
  })

  it('returns undefined when the cookie is missing', () => {
    mockGetCookie.mockReturnValue(undefined)

    const credentials = new CookieCredentials()

    expect(credentials.getAccessToken()).toBeUndefined()
  })

  it('reads a custom cookie name', () => {
    mockGetCookie.mockReturnValue('other-token')

    const credentials = new CookieCredentials('Other_Token')

    expect(credentials.getAccessToken()).toBe('other-token')
    expect(mockGetCookie).toHaveBeenCalledWith('Other_Token')
  })
})
