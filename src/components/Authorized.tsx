import { TipoUsuario } from '@/@types/components'
import { useAuth } from '@/contexts/Auth/useAuth'

export interface AuthorizedProps extends React.PropsWithChildren {
    roles: TipoUsuario[]
}

export function Authorized({ roles, children }: AuthorizedProps) {
    const { user } = useAuth()
    if (!user) return null
    if (!roles.includes(user.tipo_usuario_id)) return null

    return children
}

export default null
