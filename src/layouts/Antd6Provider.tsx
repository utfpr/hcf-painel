import type { ReactNode } from 'react'

import { App, ConfigProvider } from 'antd6'

import { AppearanceProvider } from '@/theme/AppearanceProvider'
import { buildHerbariumTheme } from '@/theme/herbariumTheme'
import { useAppearance } from '@/theme/useAppearance'

const PREFIX_CLS = 'ant6'
const ICON_PREFIX_CLS = 'ant6icon'

function Antd6ThemeProvider({ children }: { children: ReactNode }) {
  const { isDark } = useAppearance()

  return (
    <ConfigProvider
      prefixCls={PREFIX_CLS}
      iconPrefixCls={ICON_PREFIX_CLS}
      theme={buildHerbariumTheme(isDark)}
    >
      <App>{children}</App>
    </ConfigProvider>
  )
}

export function Antd6Provider({ children }: { children: ReactNode }) {
  return (
    <AppearanceProvider>
      <Antd6ThemeProvider>
        {children}
      </Antd6ThemeProvider>
    </AppearanceProvider>
  )
}
