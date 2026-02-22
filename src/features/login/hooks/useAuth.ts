// hcf-painel/src/features/login/hooks/useAuth.ts

import { useCallback } from 'react'

import { LoginRequest, LoginResponse } from '../../../@types/components'
import { useContainer } from '../../../contexts/Container/useContainer'
import { AuthService } from '../../../services/AuthService'

export const useAuth = () => {
    const { broker } = useContainer()
    const authService = AuthService.getInstance()

    const login = useCallback((credentials: LoginRequest): Promise<LoginResponse> => {
        return authService.login(credentials)
    }, [authService])

    const saveCredentials = useCallback((data: LoginResponse): void => {
        authService.saveUserCredentials(data, broker)
    }, [authService, broker])

    return {
        login,
        saveCredentials
    }
}

export default null
