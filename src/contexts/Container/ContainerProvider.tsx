import { useMemo } from 'react'

import { broker } from '@/libraries/events/Broker'
import { HttpClient } from '@/libraries/http/HttpClient'

import { ContainerContext, ContainerContextValue } from './ContainerContext'

interface ContainerProviderProps extends React.PropsWithChildren {
    baseUrl: string
}

export function ContainerProvider({ children, baseUrl }: ContainerProviderProps) {
    const httpClient = new HttpClient({
        baseUrl,
        broker
    })

    const contextValue = useMemo<ContainerContextValue>(() => ({
        httpClient,
        broker
    }), [httpClient])

    return (
        <ContainerContext.Provider value={contextValue}>
            {children}
        </ContainerContext.Provider>
    )
}

export default null
