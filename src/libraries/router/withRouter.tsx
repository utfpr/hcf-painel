import { ComponentType } from 'react'

import {
  useLocation, useNavigate, useParams
} from 'react-router'

export interface RouterProps {
  match: {
    params: Record<string, string | undefined>
  }
  history: {
    push(path: string): void
    replace(path: string): void
    goBack(): void
  }
  location: ReturnType<typeof useLocation>
}

/**
 * Compatibility HOC that provides React Router v4-style `match`, `history`,
 * and `location` props to class components running inside a React Router 7 context.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withRouter(WrappedComponent: ComponentType<any>): ComponentType {
  function RouterPropsAdapter(props: Record<string, unknown>) {
    const params = useParams()
    const navigate = useNavigate()
    const location = useLocation()

    const routerProps: RouterProps = {
      match: { params },
      history: {
        push: (path: string) => navigate(path),
        replace: (path: string) => navigate(path, { replace: true }),
        goBack: () => navigate(-1)
      },
      location
    }

    return <WrappedComponent {...props} {...routerProps} />
  }

  RouterPropsAdapter.displayName = `withRouter(${WrappedComponent.displayName ?? WrappedComponent.name ?? 'Component'})`

  return RouterPropsAdapter
}
