import type { ReactNode } from 'react'

import { App, ConfigProvider } from 'antd6'

import { antd6Theme } from './antd6Theme'

const PREFIX_CLS = 'ant6'
const ICON_PREFIX_CLS = 'ant6icon'

export function Antd6Provider({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider
      prefixCls={PREFIX_CLS}
      iconPrefixCls={ICON_PREFIX_CLS}
      theme={antd6Theme}
    >
      <App>{children}</App>
    </ConfigProvider>
  )
}
