import 'antd/dist/antd.css'
import '@/assets/css/antd-theme.css'
import '@/assets/css/App.css'
import '@/assets/css/FormEnterSystem.css'
import '@/assets/css/Main.css'
import '@/assets/css/Search.css'
import 'react-image-gallery/styles/css/image-gallery.css'

import { ConfigProvider } from 'antd'
import { ConfigProvider as Antd6ConfigProvider } from 'antd6'
import { Outlet } from 'react-router'

export function Ant4Layout() {
  return (
    <ConfigProvider>
      <Antd6ConfigProvider prefixCls="ant6">
        <Outlet />
      </Antd6ConfigProvider>
    </ConfigProvider>
  )
}
