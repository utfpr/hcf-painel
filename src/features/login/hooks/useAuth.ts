// hcf-painel/src/features/login/hooks/useAuth.ts

import { useCallback } from 'react'

import { LoginRequest, LoginResponse, ApiError } from '../../../@types/components'
import { AuthService } from '../../../services/AuthService'

export const useAuth = () => {
    const authService = AuthService.getInstance()

    const login = useCallback(async (credentials: LoginRequest): Promise<LoginResponse> => {
        return await authService.login(credentials)
    }, [authService])

    const saveCredentials = useCallback((data: LoginResponse): void => {
        authService.saveUserCredentials(data)
    }, [authService])

    return {
        login,
        saveCredentials
    }
}
