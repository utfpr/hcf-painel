export const APPEARANCE_STORAGE_KEY = 'hcf.appearance'

export type AppearanceMode = 'system' | 'light' | 'dark'

export function isAppearanceMode(value: unknown): value is AppearanceMode {
  return value === 'system' || value === 'light' || value === 'dark'
}

export function resolveDark(mode: AppearanceMode, systemDark: boolean): boolean {
  if (mode === 'dark') return true
  if (mode === 'light') return false
  return systemDark
}
