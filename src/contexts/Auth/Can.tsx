import { Action, Resource } from '@/resources/permissions'

import { useAuth } from './useAuth'

interface CanProps extends React.PropsWithChildren {
    not?: boolean
    action: Action
    resource: Resource
}

export function Can({
    not, action, resource, children
}: CanProps) {
    const { can } = useAuth()
    if (not ? !can(action, resource) : can(action, resource)) return null
    return children
}

export default null
