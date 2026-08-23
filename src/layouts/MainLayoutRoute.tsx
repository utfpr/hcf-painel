import { Outlet } from 'react-router'

import { useAuth } from '@/contexts/Auth/useAuth'

import MainLayout from './MainLayout'

export function MainLayoutRoute() {
  const auth = useAuth()

  return (
    <MainLayout auth={auth}>
      <Outlet />
    </MainLayout>
  )
}
