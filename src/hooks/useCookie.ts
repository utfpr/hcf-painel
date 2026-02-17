import { useCallback, useEffect, useState } from 'react'

import type { CookieSetOptions } from 'universal-cookie'

import { getCookie, removeCookie, setCookie } from '@/helpers/cookie'

type UseCookieReturn = [value: string | undefined, (value: string, options?: CookieSetOptions) => void, () => void]

export function useCookie(name: string): UseCookieReturn {
    const [cookieValue, setCookieValue] = useState<string | undefined>(() => {
        const value = getCookie<string>(name) ?? undefined
        return value
    })

    const setValueFn = useCallback<(
    value: string, options?: CookieSetOptions) => void>(
        (newValue, options) => {
            setCookie(name, newValue, options)
            setCookieValue(newValue)

            const event: CustomEvent<{ name: string }> = new CustomEvent('cookie.changed', {
                cancelable: false,
                detail: { name }
            })
            window.dispatchEvent(event)
        },
        [name]
        )

    const removeValueFn = useCallback(() => {
        removeCookie(name)
        setCookieValue(undefined)

        const event: CustomEvent<{ name: string }> = new CustomEvent('cookie.removed', {
            cancelable: false,
            detail: { name }
        })
        window.dispatchEvent(event)
    }, [name])

    useEffect(() => {
        const handleCookieChange = (event: Event): void => {
            if (event instanceof CustomEvent && (event as CustomEvent<{ name: string }>).detail.name === name) {
                setCookieValue(getCookie(name))
            }
        }
        window.addEventListener('cookie.changed', handleCookieChange)

        return () => {
            window.removeEventListener('cookie.changed', handleCookieChange)
        }
    }, [])

    return [cookieValue, setValueFn, removeValueFn]
}

export default null
