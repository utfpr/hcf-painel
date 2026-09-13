import { createContext } from 'react'

import type { AppearanceMode } from './appearance'

export interface AppearanceContextValue {
  mode: AppearanceMode
  isDark: boolean
  setAppearance: (mode: AppearanceMode) => void
}

export const AppearanceContext = createContext<AppearanceContextValue | undefined>(undefined)
