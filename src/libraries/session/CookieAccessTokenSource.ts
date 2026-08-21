import { getCookie } from '@/helpers/cookie'
import type { AccessTokenSource } from '@/libraries/http/AccessTokenSource'

export class CookieAccessTokenSource implements AccessTokenSource {
  constructor(private readonly cookieName = 'Access_Token') {}

  getAccessToken(): string | undefined {
    return getCookie<string>(this.cookieName)
  }
}
