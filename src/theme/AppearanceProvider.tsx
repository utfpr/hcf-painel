import {
  useEffect, useMemo, useState, type ReactNode
} from 'react'

import { useLocalStorage } from '@/hooks/useLocalStorage'

import {
  APPEARANCE_STORAGE_KEY,
  isAppearanceMode,
  resolveDark,
  type AppearanceMode
} from './appearance'
import { AppearanceContext } from './AppearanceContext'

function getSystemDark(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useLocalStorage<AppearanceMode>(
    APPEARANCE_STORAGE_KEY,
    'system'
  )
  const [systemDark, setSystemDark] = useState(getSystemDark)

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (event: MediaQueryListEvent) => {
      setSystemDark(event.matches)
    }
    media.addEventListener('change', onChange)
    return () => {
      media.removeEventListener('change', onChange)
    }
  }, [])

  const mode: AppearanceMode = isAppearanceMode(stored) ? stored : 'system'
  const isDark = resolveDark(mode, systemDark)

  const value = useMemo(() => ({
    mode,
    isDark,
    setAppearance: setStored
  }), [
    mode,
    isDark,
    setStored
  ])

  return (
    <AppearanceContext.Provider value={value}>
      {children}
    </AppearanceContext.Provider>
  )
}
