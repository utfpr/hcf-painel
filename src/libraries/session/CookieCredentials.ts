import { getCookie } from '@/helpers/cookie'
import type { Credentials } from '@/libraries/http/Credentials'

export class CookieCredentials implements Credentials {
  constructor(private readonly cookieName = 'Access_Token') {}

  getAccessToken(): string | undefined {
    return getCookie<string>(this.cookieName)
  }
}
