import { Outlet } from 'react-router'

import { Antd6Provider } from './Antd6Provider'

export function Ant6Layout() {
  return (
    <Antd6Provider>
      <Outlet />
    </Antd6Provider>
  )
}
