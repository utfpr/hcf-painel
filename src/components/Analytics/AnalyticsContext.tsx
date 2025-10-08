import { createContext, useRef } from "react"
import { Analytics, LogRocketAnalytics } from "./Analytics"

export interface AnalyticsProviderProps {
  appId?: string
  children: React.ReactNode
}

export const AnalyticsContext = createContext<{analytics: Analytics | undefined} | undefined>(undefined)

export function AnalyticsProvider({ appId, children }: AnalyticsProviderProps) {
  const analytics = useRef<Analytics>()

  if (appId && !analytics.current) {
    analytics.current = new LogRocketAnalytics(appId)
  }

  return (
    <AnalyticsContext.Provider value={{analytics: analytics.current}}>
      {children}
    </AnalyticsContext.Provider>
  )
}
