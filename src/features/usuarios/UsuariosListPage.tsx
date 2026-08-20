import { isRedesignEnabled } from '@/config/redesign'

import ListaUsuariosLegacyScreen from './ListaUsuariosScreen'
import ListaUsuariosRedesignScreen from './redesign/ListaUsuariosScreen'

export default isRedesignEnabled()
  ? ListaUsuariosRedesignScreen
  : ListaUsuariosLegacyScreen
