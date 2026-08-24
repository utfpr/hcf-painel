import { isRedesignEnabled } from '@/config/redesign'

import ListaUsuariosLegacyPage from './ListaUsuariosPage'
import ListaUsuariosRedesignPage from './redesign/ListaUsuariosPage'

export default isRedesignEnabled()
  ? ListaUsuariosRedesignPage
  : ListaUsuariosLegacyPage
