import React from 'react'

import { Route, Routes } from 'react-router-dom'

import LoginPage from '../domains/LoginPage'
import AdminLayout from '../layout/AdminLayout'
import routes from './admin'

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
      <Route path="/admin" element={<AdminLayout />}>
        {routes.map(renderRouteItem)}
      </Route>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<LoginPage />} />
    </Routes>
  )
}

export default RouteManager
