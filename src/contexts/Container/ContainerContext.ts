import { createContext } from 'react'

import type { Broker } from '@/libraries/events/Broker'
import type { HttpClient } from '@/libraries/http/HttpClient'

export interface ContainerContextValue {
    httpClient: HttpClient
    broker: Broker
}

export const ContainerContext = createContext<ContainerContextValue | undefined>(undefined)

export default null
