import { createBrowserRouter } from 'react-router'

import { AppRoutes } from './App'
import { Edvaldo } from './components/Edvaldo'
import InicioScreen from './features/login/InicioScreen'
import { Ant4Layout } from './layouts/Ant4'
import { Ant6Layout } from './layouts/Ant6'
import { MainLayoutRoute } from './layouts/MainLayoutRoute'
import { layout, route } from './libraries/router'
import RecuperarSenhaScreen from './pages/recuperacaoSenha/RecuperarSenhaScreen'
import ResetSenhaScreen from './pages/recuperacaoSenha/ResetSenhaScreen'

export const router = createBrowserRouter([
  layout(Ant6Layout, [route('users', Edvaldo)]),
  {
    Component: Ant4Layout,
    children: [
      route('reset-senha', ResetSenhaScreen),
      route('recuperar-senha', RecuperarSenhaScreen),
      route('inicio', InicioScreen),
      {
        Component: MainLayoutRoute,
        children: [{ path: '*', Component: AppRoutes }]
      }
    ]
  }
], {
  basename: import.meta.env.VITE_BASE_URL as string | undefined
})
