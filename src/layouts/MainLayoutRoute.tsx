import { Outlet } from 'react-router'

import MainLayout from './MainLayout'

export function MainLayoutRoute() {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  )
}
