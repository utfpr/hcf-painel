import {
    useCallback, useMemo, useState
} from 'react'

import { Usuario } from '@/@types/components'
import { useCookie } from '@/hooks/useCookie'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { Manager } from '@/libraries/auth/Manager'
import { Action, createRules, Resource } from '@/resources/permissions'

import { AuthContext } from './AuthContext'

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [accessToken, setAccessToken, removeAccessToken] = useCookie('Access_Token')
    const [loggedUser, setLoggedUser, removeLoggedUser] = useLocalStorage<Usuario>('Logged_User')
    // TODO: remove this when all components are updated to use the new access token
    /** @deprecated This is used to support the old access token */
    const [, setOldAccessToken, removeOldAccessToken] = useLocalStorage<string>('token')

    const loggedIn = Boolean(accessToken) && Boolean(loggedUser?.id)

    const [attributes, setAttributes] = useState<{ token?: string; user?: Usuario } | undefined>(() => {
        if (loggedIn) {
            return {
                token: accessToken,
                user: loggedUser
            }
        }

        return undefined
    })

    const manager = useMemo(() => {
        return new Manager<Resource, Action>(createRules(attributes?.user))
    }, [attributes?.user])

    const can = useCallback((action: Action, resource: Resource) => {
        return manager.can(action, resource)
    }, [manager])

    const canAny = useCallback((actions: Action[], resource: Resource) => {
        return manager.canAny(actions, resource)
    }, [manager])

    const canAll = useCallback((actions: Action[], resource: Resource) => {
        return manager.canAll(actions, resource)
    }, [manager])

    const logIn = useCallback((params: {token: string; user: Usuario}) => {
        setAccessToken(params.token)
        setOldAccessToken(params.token)
        setLoggedUser(params.user)
        setAttributes(params)
    }, [])

    const logOut = useCallback(() => {
        setAttributes(undefined)
        removeAccessToken()
        removeLoggedUser()
        removeOldAccessToken()
    }, [])

    const contextValue = useMemo(() => {
        return {
            ...attributes,
            loggedIn,
            can,
            canAny,
            canAll,
            logIn,
            logOut
        }
    }, [attributes, logIn, logOut])

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    )
}

export default null
