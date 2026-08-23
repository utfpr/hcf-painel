import 'antd/dist/antd.css'
import '@/assets/css/antd-theme.css'
import '@/assets/css/App.css'
import '@/assets/css/FormEnterSystem.css'
import '@/assets/css/Main.css'
import '@/assets/css/Search.css'
import 'react-image-gallery/styles/css/image-gallery.css'

import { ConfigProvider } from 'antd'
import { Outlet } from 'react-router'

import { Antd6Provider } from './Antd6Provider'

export function Ant4Layout() {
  return (
    <ConfigProvider>
      <Antd6Provider>
        <Outlet />
      </Antd6Provider>
    </ConfigProvider>
  )
}
