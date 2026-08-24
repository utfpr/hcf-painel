import { isRedesignEnabled } from '@/config/redesign'

import ListaUsuariosLegacyPage from './ListaUsuariosPage'
import ListaUsuariosRedesignScreen from './redesign/ListaUsuariosScreen'

export default isRedesignEnabled()
  ? ListaUsuariosRedesignScreen
  : ListaUsuariosLegacyPage
