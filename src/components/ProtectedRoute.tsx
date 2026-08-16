import { Outlet } from 'react-router'

import { useAuth } from '@/contexts/Auth/useAuth'
import {
  isCuradorOuOperador,
  isCuradorOuOperadorOuIdentificador
} from '@/helpers/usuarios'
import UnauthorizedScreen from '@/pages/UnauthorizedScreen'
import { Action, Resource } from '@/resources/permissions'

function Guard({ allowed }: { allowed: boolean }) {
  if (!allowed) return <UnauthorizedScreen />
  return <Outlet />
}

export function CuradorOuOperadorGuard() {
  return <Guard allowed={isCuradorOuOperador()} />
}

export function CuradorOuOperadorOuIdentificadorGuard() {
  return <Guard allowed={isCuradorOuOperadorOuIdentificador()} />
}

export function LoggedInGuard() {
  const auth = useAuth()
  return <Guard allowed={Boolean(auth.user?.id)} />
}

export function PermissionGuard({ action, resource }: { action: Action; resource: Resource }) {
  const auth = useAuth()
  return <Guard allowed={auth.can(action, resource)} />
}
