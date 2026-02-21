import { createContext } from 'react'

import { Usuario } from '@/@types/components'
import { Action, Resource } from '@/resources/permissions'

export interface AuthContextValue {
    token?: string
    user?: Usuario
    loggedIn: boolean
    can(action: Action, resource: Resource): boolean
    canAny(actions: Action[], resource: Resource): boolean
    canAll(actions: Action[], resource: Resource): boolean
    logIn(params: {token: string; user: Usuario}): void
    logOut(): void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export default null
