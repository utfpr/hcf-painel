import { useMemo } from 'react'

import { broker } from '@/libraries/events/Broker'
import { HttpClient } from '@/libraries/http/HttpClient'
import { CookieAccessTokenSource } from '@/libraries/session/CookieAccessTokenSource'

import { ContainerContext, ContainerContextValue } from './ContainerContext'

interface ContainerProviderProps extends React.PropsWithChildren {
  baseUrl: string
}

export function ContainerProvider({ children, baseUrl }: ContainerProviderProps) {
  const accessTokenSource = useMemo(() => new CookieAccessTokenSource(), [])

  const httpClient = useMemo(
    () => new HttpClient({
      baseUrl,
      broker,
      accessTokenSource
    }),
    [baseUrl, accessTokenSource]
  )

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
