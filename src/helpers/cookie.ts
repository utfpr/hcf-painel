import UniversalCookie, { type CookieSetOptions } from 'universal-cookie'

const cookies = new UniversalCookie()

export function getCookie<T>(name: string): T | undefined {
    return cookies.get<T>(name)
}

export function setCookie(name: string, value: string, options?: CookieSetOptions): void {
    return cookies.set(name, value, options)
}

export function removeCookie(name: string, options?: CookieSetOptions): void {
    return cookies.remove(name, options)
}
