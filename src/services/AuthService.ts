// hcf-painel/src/services/AuthService.ts

import axios from 'axios'

import {
    LoginRequest, LoginResponse, ApiError, RateLimitResult
} from '../@types/components'
import rateLimiter from '../helpers/rateLimiter'
import { setTokenUsuario, setUsuario } from '../helpers/usuarios'

export class AuthService {
    private static instance: AuthService

    private constructor() {}

    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService()
        }
        return AuthService.instance
    }

    public async login(credentials: LoginRequest): Promise<LoginResponse> {
        const { email, senha } = credentials

        // Verifica rate limit para login
        const rateLimitCheck = rateLimiter.checkLimit('login', email) as RateLimitResult
        if (!rateLimitCheck.allowed) {
            const resetTime = rateLimiter.formatResetTime(rateLimitCheck.resetTime)
            const error: ApiError = {
                mensagem: `Muitas tentativas de login. Tente novamente em ${resetTime}.`,
                codigo: 429
            }
            throw error
        }

        try {
            const response = await axios.post('/login', { email, senha })

            if (response.status !== 200) {
                const error: ApiError = {
                    mensagem: response.data.error.message,
                    codigo: response.status
                }
                throw error
            }

            // Login bem-sucedido - limpa tentativas de rate limit
            rateLimiter.clearAttempts('login', email)

            return response.data
        } catch (error: any) {
            // Registra tentativa falhada no rate limit
            rateLimiter.recordAttempt('login', email)

            if (error.response && error.response.data) {
                const apiError: ApiError = {
                    mensagem: error.response.data.error.message,
                    codigo: error.response.status
                }
                throw apiError
            }

            throw error
        }
    }

    public saveUserCredentials(data: LoginResponse): void {
        setTokenUsuario(data.token)
        localStorage.setItem('token', data.token)

        setUsuario(data.usuario)
        const usuario = JSON.stringify(data.usuario)
        localStorage.setItem('usuario', usuario)

        // Dispatch event to notify UI components
        const event = new Event('userNameUpdated')
        window.dispatchEvent(event)
    }
}
