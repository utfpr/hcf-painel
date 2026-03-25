import 'antd6/dist/reset.css'

import { ConfigProvider } from 'antd6'
import { Outlet } from 'react-router'

export function Ant6Layout() {
  return (
    <ConfigProvider>
      <Outlet />
    </ConfigProvider>
  )
}
