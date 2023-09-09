import React from 'react'

import { Route, Routes } from 'react-router-dom'

import InicioScreen from '../pages/InicioScreen'
import MainLayout from '../layouts/MainLayout'
import routes from './private'

const RouteManager = () => {
  const renderRouteItem = route => {
    if (route.group) {
      return route.routes.map(renderRouteItem)
    }

    const { path } = route
    return (
      <Route
        key={path}
        path={path.replace('/', '')}
        element={<route.component />}
      />
    )
  }

  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {routes.map(renderRouteItem)}
      </Route>
      <Route path="/inicio" element={<InicioScreen />} />
    </Routes>
  )
}

export default RouteManager
