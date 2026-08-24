import type { ReactNode } from 'react'

import { App, ConfigProvider } from 'antd6'
import { Outlet } from 'react-router'

import { AppearanceProvider } from '@/theme/AppearanceProvider'
import { buildHerbariumTheme } from '@/theme/theme'
import { useAppearance } from '@/theme/useAppearance'

import { AppShell } from './AppShell'

function AppShellTheme({ children }: { children: ReactNode }) {
  const { isDark } = useAppearance()

  return (
    <ConfigProvider
      prefixCls="ant6"
      iconPrefixCls="ant6icon"
      theme={buildHerbariumTheme(isDark)}
    >
      <App>{children}</App>
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
