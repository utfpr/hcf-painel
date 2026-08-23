export interface IndexRoute {
  index: true
  Component: React.ComponentType
}

export interface NonIndexRoute {
  index?: false
  path?: string
  Component: React.ComponentType
  children?: Route[]
}

export type Route = IndexRoute | NonIndexRoute

export function layout(component: React.ComponentType, children: Route[]): NonIndexRoute {
  return {
    Component: component,
    children
  }
}

export function index(component: React.ComponentType): Route {
  return {
    index: true,
    Component: component
  }
}

export function route(path: string, component: React.ComponentType): Route {
  return {
    path,
    Component: component
  }
}
