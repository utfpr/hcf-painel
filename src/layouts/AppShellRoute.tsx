import { useEffect, type ReactNode } from 'react'

import {
  App, ConfigProvider, theme
} from 'antd6'
import { Outlet } from 'react-router'

import { AppearanceProvider } from '@/theme/AppearanceProvider'
import { buildHerbariumTheme } from '@/theme/theme'
import { useAppearance } from '@/theme/useAppearance'

import { AppShell } from './AppShell'

function DocumentAppearance() {
  const { token } = theme.useToken()
  const { isDark } = useAppearance()

  useEffect(() => {
    const root = document.documentElement
    const body = document.body
    const previousScheme = root.style.colorScheme
    const previousBackground = body.style.backgroundColor
    const previousColor = body.style.color

    root.style.colorScheme = isDark ? 'dark' : 'light'
    body.style.backgroundColor = token.colorBgLayout
    body.style.color = token.colorText

    return () => {
      root.style.colorScheme = previousScheme
      body.style.backgroundColor = previousBackground
      body.style.color = previousColor
    }
  }, [
    isDark,
    token.colorBgLayout,
    token.colorText
  ])

  return null
}

function AppShellTheme({ children }: { children: ReactNode }) {
  const { isDark } = useAppearance()

  return (
    <ConfigProvider
      prefixCls="ant6"
      iconPrefixCls="ant6icon"
      theme={buildHerbariumTheme(isDark)}
    >
      <App>
        <DocumentAppearance />
        {children}
      </App>
    </ConfigProvider>
  )
}

export function AppShellRoute() {
  return (
    <AppearanceProvider>
      <AppShellTheme>
        <AppShell>
          <Outlet />
        </AppShell>
      </AppShellTheme>
    </AppearanceProvider>
  )
}
