import {
    useCallback, useMemo, useState
} from 'react'

import { Usuario } from '@/@types/components'
import { useCookie } from '@/hooks/useCookie'
import { useLocalStorage } from '@/hooks/useLocalStorage'

import { AuthContext } from './AuthContext'

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [accessToken, setAccessToken, removeAccessToken] = useCookie('Access_Token')
    const [loggedUser, setLoggedUser, removeLoggedUser] = useLocalStorage<Usuario>('Logged_User')
    // TODO: remove this when all components are updated to use the new access token
    /** @deprecated This is used to support the old access token */
    const [, setOldAccessToken, removeOldAccessToken] = useLocalStorage<string>('token')

    const [authValue, setAuthValue] = useState<{ token?: string; user?: Usuario } | undefined>(() => {
        if (accessToken && loggedUser) {
            return {
                token: accessToken,
                user: loggedUser
            }
        }

        return undefined
    })

    const logIn = useCallback((params: {token: string; user: Usuario}) => {
        setAccessToken(params.token)
        setOldAccessToken(params.token)
        setLoggedUser(params.user)
        setAuthValue(params)
    }, [])

    const logOut = useCallback(() => {
        setAuthValue(undefined)
        removeAccessToken()
        removeLoggedUser()
        removeOldAccessToken()
    }, [])

    const contextValue = useMemo(() => {
        return {
            ...authValue,
            logIn,
            logOut
        }
    }, [authValue, logIn, logOut])

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    )
}

export default null
