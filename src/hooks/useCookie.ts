import { useCallback, useEffect, useState } from 'react'

import type { CookieSetOptions } from 'universal-cookie'

import { useContainer } from '@/contexts/Container/useContainer'
import { getCookie, removeCookie, setCookie } from '@/helpers/cookie'

type UseCookieReturn = [value: string | undefined, (value: string, options?: CookieSetOptions) => void, () => void]

export function useCookie(name: string): UseCookieReturn {
    const { broker } = useContainer()

    const [cookieValue, setCookieValue] = useState<string | undefined>(() => {
        const value = getCookie<string>(name) ?? undefined
        return value
    })

    const setValueFn = useCallback<(
    value: string, options?: CookieSetOptions) => void>(
        (newValue, options) => {
            setCookie(name, newValue, options)
            setCookieValue(newValue)

            broker.emit('cookie.updated', { name })
        },
        [broker, name]
        )

    const removeValueFn = useCallback(() => {
        removeCookie(name)
        setCookieValue(undefined)

        broker.emit('cookie.removed', { name })
    }, [broker, name])

    useEffect(() => {
        const handleCookieUpdate = (detail: unknown): void => {
            const { name: eventName } = detail as { name: string }
            if (eventName === name) {
                setCookieValue(getCookie(name))
            }
        }
        broker.subscribe('cookie.updated', handleCookieUpdate)

        return () => {
            broker.unsubscribe('cookie.updated', handleCookieUpdate)
        }
    }, [broker, name])

    return [cookieValue, setValueFn, removeValueFn]
}

export default null
