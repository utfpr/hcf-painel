import { lazy } from 'react'

import {
  IoMdPeople, IoMdArchive, IoMdWarning, IoIosBusiness,
  IoMdLeaf, IoMdBusiness, IoIosFlag, IoIosAlbums,
  IoIosBookmarks
} from 'react-icons/io'

const NovoUsuarioScreen = lazy(() => import('../pages/Usuarios/NovoUsuarioScreen'))
const ListaUsuariosScreen = lazy(() => import('../pages/Usuarios/ListaUsuariosScreen'))
const NovaRemessaScreen = lazy(() => import('../pages/Remessas/NovaRemessaScreen'))
const ListaRemessasScreen = lazy(() => import('../pages/Remessas/ListaRemessasScreen'))
const VerPendenciaScreen = lazy(() => import('../pages/Pendencias/VerPendenciaScreen'))
const ListaPendenciasScreen = lazy(() => import('../pages/Pendencias/ListaPendenciasScreen'))
const NovoHerbarioScreen = lazy(() => import('../pages/Herbarios/NovoHerbarioScreen'))
const ListaHerbariosScreen = lazy(() => import('../pages/Herbarios/ListaHerbariosScreen'))
const ListaTaxonomiaScreen = lazy(() => import('../pages/Taxonomias/ListaTaxonomiaScreen'))
const FichaTomboScreen = lazy(() => import('../pages/Tombos/FichaTomboScreen'))
const DetalhesTomboScreen = lazy(() => import('../pages/Tombos/DetalhesTomboScreen'))
const ListaTombosScreen = lazy(() => import('../pages/Tombos/ListaTombosScreen'))
const NovoTomboScreen = lazy(() => import('../pages/Tombos/NovoTomboScreen'))
const ServicosRefloraScreen = lazy(() => import('../pages/ServicosRefloraScreen'))
const ServicosSpeciesLinkScreen = lazy(() => import('../pages/ServicosSpeciesLinkScreen'))
const LivroTomboScreen = lazy(() => import('../pages/Tombos/LivroTomboScreen'))
const ListaTaxonomiaEspecie = lazy(() => import('../pages/Taxonomias/ListaTaxonomiaEspecie'))
const ListaTaxonomiaFamilia = lazy(() => import('../pages/Taxonomias/ListaTaxonomiaFamilia'))
const ListaTaxonomiaGenero = lazy(() => import('../pages/Taxonomias/ListaTaxonomiaGenero'))
const ListaTaxonomiaSubespecie = lazy(() => import('../pages/Taxonomias/ListaTaxonomiaSubespecie'))
const ListaTaxonomiaSubfamilia = lazy(() => import('../pages/Taxonomias/ListaTaxonomiaSubfamilia'))
const ListaTaxonomiaVariedade = lazy(() => import('../pages/Taxonomias/ListaTaxonomiaVariedade'))
const ListaTaxonomiaAutores = lazy(() => import('../pages/Taxonomias/ListaTaxonomiaAutores'))

import {
  setTokenUsuario,
  setUsuario,
  getTokenUsuario,
  isCurador,
  isCuradorOuOperador,
  isCuradorOuOperadorOuIdentificador
} from '../helpers/usuarios';

const usuarios = [
  {
    path: '/usuarios/novo',
    component: NovoUsuarioScreen,
    permission: isCurador
  },
  {
    path: '/usuarios/:usuario_id',
    component: NovoUsuarioScreen,
    permission: isCurador
  },
  {
    path: '/usuarios',
    component: ListaUsuariosScreen,
    permission: isCurador,
    menu: {
      key: 'usuario',
      text: 'Usuarios',
      icon: IoMdPeople
    }
  },
]

const remessas = [
  {
    path: '/remessas/novo',
    component: NovaRemessaScreen,
    permission: isCuradorOuOperador
  },
  {
    path: '/remessas/:remessa_id',
    component: NovaRemessaScreen,
    permission: isCuradorOuOperador
  },
  {
    path: '/remessas',
    component: ListaRemessasScreen,
    permission: isCuradorOuOperador,
    menu: {
      key: 'remessas',
      text: 'Remessas',
      icon: IoMdArchive
    }
  },
]

const pendencias = [
  {
    path: '/pendencias/:pendencia_id',
    component: VerPendenciaScreen,
    permission: isCuradorOuOperador
  },
  {
    path: '/pendencias',
    component: ListaPendenciasScreen,
    permission: isCuradorOuOperador,
    menu: {
      key: 'pendencias',
      text: 'Pendencias',
      icon: IoMdWarning
    }
  },
]

const tombos = [
  {
    path: '/tombos/detalhes/:tombo_id',
    component: DetalhesTomboScreen,
    permission: isCuradorOuOperadorOuIdentificador
  },
  {
    path: '/tombos/novo',
    component: NovoTomboScreen,
    permission: isCuradorOuOperadorOuIdentificador
  },
  {
    path: '/tombos/:tombo_id"',
    component: NovoTomboScreen,
    permission: isCuradorOuOperadorOuIdentificador
  },
  {
    path: '/tombos',
    component: ListaTombosScreen,
    permission: isCuradorOuOperadorOuIdentificador,
    menu: {
      key: 'tombos',
      text: 'Tombos',
      icon: IoMdLeaf
    }
  },
]

const herbarios = [
  {
    path: '/herbarios/novo',
    component: NovoHerbarioScreen,
    permission: isCuradorOuOperador
  },
  {
    path: '/herbarios/:herbario_id',
    component: NovoHerbarioScreen,
    permission: isCuradorOuOperador
  },
  {
    path: '/herbarios',
    component: ListaHerbariosScreen,
    permission: isCuradorOuOperador,
    menu: {
      key: 'herbarios',
      text: 'Herbarios',
      icon: IoMdBusiness
    }
  },
]

const routes = [
  ...usuarios,
  ...remessas,
  ...pendencias,
  ...tombos,
  ...herbarios,
  {
    path: '/taxonomias',
    component: ListaTaxonomiaScreen,
    permission: isCuradorOuOperador,
    menu: {
      key: 'taxonomias',
      text: 'Taxonomias',
      icon: IoIosFlag
    }
  },
  {
    path: '/fichas-tombos',
    component: FichaTomboScreen,
    permission: isCuradorOuOperador,
    menu: {
      key: 'fichas',
      text: 'Fichas do tombo',
      icon: IoIosAlbums
    }
  },
  {
    path: '/reflora',
    component: ServicosRefloraScreen,
    permission: isCurador,
    menu: {
      key: 'reflora',
      text: 'Serviço Reflora',
      icon: IoIosBusiness
    }
  },
  {
    path: '/specieslink',
    component: ServicosSpeciesLinkScreen,
    permission: isCurador,
    menu: {
      key: 'speciesLink',
      text: 'Serviço Species Link',
      icon: IoIosBusiness
    }
  },
  {
    path: '/livro-tombo',
    component: LivroTomboScreen,
    permission: isCurador,
    menu: {
      key: 'livroTombo',
      text: 'Livro tombo',
      icon: IoIosBookmarks
    }
  },
  {
    path: '/especies',
    component: ListaTaxonomiaEspecie,
    permission: isCuradorOuOperador,
    menu: {
      key: 'especie',
      text: 'Especies',
      icon: IoIosBookmarks
    }
  },
  {
    path: '/familias',
    component: ListaTaxonomiaFamilia,
    permission: isCuradorOuOperador,
    menu: {
      key: 'familias',
      text: 'Familias',
      icon: IoIosBookmarks
    }
  },
  {
    path: '/generos',
    component: ListaTaxonomiaGenero,
    permission: isCuradorOuOperador,
    menu: {
      key: 'generos',
      text: 'Generos',
      icon: IoIosBookmarks
    }
  },
  {
    path: '/subespecies',
    component: ListaTaxonomiaSubespecie,
    permission: isCuradorOuOperador,
    menu: {
      key: 'subespecies',
      text: 'Subespecies',
      icon: IoIosBookmarks
    }
  },
  {
    path: '/subfamilias',
    component: ListaTaxonomiaSubfamilia,
    permission: isCuradorOuOperador,
    menu: {
      key: 'subfamilias',
      text: 'Subfamilias',
      icon: IoIosBookmarks
    }
  },
  {
    path: '/variedades',
    component: ListaTaxonomiaVariedade,
    permission: isCuradorOuOperador,
    menu: {
      key: 'variedades',
      text: 'Variedades',
      icon: IoIosBookmarks
    }
  },
  {
    path: '/autores',
    component: ListaTaxonomiaAutores,
    permission: isCuradorOuOperador,
    menu: {
      key: 'autores',
      text: 'Autores',
      icon: IoIosBookmarks
    }
  }
]

export default routes
