import { useCallback } from 'react'

import { useNotification } from '@/hooks/useNotification'

import { InicioScreenProps, ApiError } from '../../../@types/components'
import { useLoading } from '../../../hooks/useLoading'
import { useMobileMenu } from '../hooks/useMobileMenu'

export interface InicioScreenViewModel {
    // State
    loading: boolean
    mobileMenuVisible: boolean

    // Actions
    handleRedirect: () => void
    handleLoad: (isLoading: boolean) => void
    handleRequestError: (error: ApiError) => void
    showMobileMenu: () => void
    closeMobileMenu: () => void
}

export const useInicioScreenViewModel = (props: InicioScreenProps): InicioScreenViewModel => {
    const { loading, startLoading, stopLoading } = useLoading()
    const { mobileMenuVisible, showMobileMenu, closeMobileMenu } = useMobileMenu()
    const { showNotification } = useNotification()

    const handleRedirect = useCallback(() => {
        props.history.push('/tombos')
    }, [props.history])

    const handleLoad = useCallback((isLoading: boolean) => {
        if (isLoading) {
            startLoading()
        } else {
            stopLoading()
        }
    }, [startLoading, stopLoading])

    const handleRequestError = useCallback((error: ApiError) => {
        if (error.codigo === 400 || error.codigo === 422) {
            showNotification({
                type: 'warning',
                message: 'Falha',
                description: error.mensagem
            })
        } else {
            showNotification({
                type: 'error',
                message: 'Falha',
                description: 'Houve um problema ao realizar o login, tente novamente.'
            })
        }
    }, [showNotification])

    return {
    // State
        loading,
        mobileMenuVisible,

        // Actions
        handleRedirect,
        handleLoad,
        handleRequestError,
        showMobileMenu,
        closeMobileMenu
    }
}
