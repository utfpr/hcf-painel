import { createContext } from 'react'

import { Usuario } from '@/@types/components'

export interface AuthContextValue {
    token?: string
    user?: Usuario
    logIn(params: {token: string; user: Usuario}): void
    logOut(): void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export default null
