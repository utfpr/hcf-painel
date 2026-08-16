import { Route, Routes } from 'react-router'

import { useAuth } from './contexts/Auth/useAuth'
import ListaUsuariosScreen from './features/usuarios/ListaUsuariosScreen'
import {
  isCuradorOuOperador,
  isCuradorOuOperadorOuIdentificador
} from './helpers/usuarios'
import { withRouter } from './libraries/router/withRouter'
import DashboardScreen from './pages/DashboardScreen'
import DetalhesTomboScreen from './pages/DetalhesTomboScreen'
import ExportaçãoScreen from './pages/ExportaçãoScreen'
import FichaTomboScreen from './pages/FichaTomboScreen'
import FiltrosMapaScreen from './pages/FiltrosMapa'
import ListaCidadesScreen from './pages/ListaCidadesScreen'
import ListaColetoresScreen from './pages/ListaColetoresScreen'
import ListaEstadosScreen from './pages/ListaEstadosScreen'
import ListaHerbariosScreen from './pages/ListaHerbariosScreen'
import ListaIdentificadoresScreen from './pages/ListaIdentificadoresScreen'
import ListaLocalColetaScreen from './pages/ListaLocalColetaScreen'
import ListaPendenciasScreen from './pages/ListaPendenciasScreen'
import ListaRemessasScreen from './pages/ListaRemessasScreen'
import ListaTaxonomiaAutores from './pages/ListaTaxonomiaAutores'
import ListaTaxonomiaEspecie from './pages/ListaTaxonomiaEspecie'
import ListaTaxonomiaFamilia from './pages/ListaTaxonomiaFamilia'
import ListaTaxonomiaGenero from './pages/ListaTaxonomiaGenero'
import ListaTaxonomiaReino from './pages/ListaTaxonomiaReino'
import ListaTaxonomiaScreen from './pages/ListaTaxonomiaScreen'
import ListaTaxonomiaSubespecie from './pages/ListaTaxonomiaSubespecie'
import ListaTaxonomiaSubfamilia from './pages/ListaTaxonomiaSubfamilia'
import ListaTaxonomiaVariedade from './pages/ListaTaxonomiaVariedade'
import ListaTombosScreen from './pages/ListaTombosScreen'
import LivroTomboScreen from './pages/LivroTomboScreen'
import Mapa from './pages/Mapa'
import NovaRemessaScreen from './pages/NovaRemessaScreen'
import NovoColetorScreen from './pages/NovoColetorScreen'
import NovoHerbarioScreen from './pages/NovoHerbarioScreen'
import NovoIdentificadorScreen from './pages/NovoIdentificadorScreen'
import NovoUsuarioScreen from './pages/NovoUsuarioScreen'
import PerfilScreen from './pages/PerfilScreen'
import RelatorioCodigoBarrasScreen from './pages/RelatorioCodigoBarrasScreen'
import RelatorioColetaPeriodoScreen from './pages/RelatorioColetaPeriodoScreen'
import RelatorioColetorPeriodoScreen from './pages/RelatorioColetorPeriodoScreen'
import RelatorioCoordenadaForaPoligonoScreen from './pages/RelatorioCoordenadaForaPoligonoScreen'
import RelatorioFamiliasGeneroScreen from './pages/RelatorioFamiliasGeneroScreen'
import RelatorioInventarioEspeciesScreen from './pages/RelatorioInventarioEspeciesScreen'
import RelatorioLocalColetaScreen from './pages/RelatorioLocalColetaPeriodoScreen'
import RelatorioPorPeriodo from './pages/RelatorioPorPeriodo'
import RelatorioQuantidadeScreen from './pages/RelatorioQtdPeriodoScreen'
import RelatorioTombosPorCidadeScreen from './pages/RelatorioTombosPorCidadeScreen'
import RfidConferencia from './pages/RfidConferencia'
import RfidConfiguracao from './pages/RfidConfiguracao'
import RfidInventario from './pages/RfidInventario'
import RfidVinculacao from './pages/RfidVinculacao'
import ServicosRefloraScreen from './pages/ServicosRefloraScreen'
import ServicosSpeciesLinkScreen from './pages/ServicosSpeciesLinkScreen'
import NovoTomboScreen from './pages/tombos/NovoTomboScreen'
import UnauthorizedScreen from './pages/UnauthorizedScreen'
import PendenciaPagina from './pages/VerPendenciaScreen'

const DetalhesTombo = withRouter(DetalhesTomboScreen)
const NovoTombo = withRouter(NovoTomboScreen)
const NovaRemessa = withRouter(NovaRemessaScreen)
const PendenciaPage = withRouter(PendenciaPagina)
const NovoHerbario = withRouter(NovoHerbarioScreen)
const NovoColetor = withRouter(NovoColetorScreen)
const NovoIdentificador = withRouter(NovoIdentificadorScreen)
const NovoUsuario = withRouter(NovoUsuarioScreen)

function guard(authed: boolean, Component: React.ComponentType) {
  return authed ? <Component /> : <UnauthorizedScreen />
}

export function AppRoutes() {
  const auth = useAuth()

  return (
    <Routes>
      <Route path="tombos/detalhes/:tombo_id" element={<DetalhesTombo />} />
      <Route path="tombos/novo" element={guard(isCuradorOuOperador(), NovoTombo)} />
      <Route path="tombos/:tombo_id" element={guard(isCuradorOuOperadorOuIdentificador(), NovoTombo)} />
      <Route path="tombos" element={<ListaTombosScreen />} />

      <Route path="taxonomias" element={<ListaTaxonomiaScreen />} />

      <Route path="pendencias/:pendencia_id" element={guard(isCuradorOuOperador(), PendenciaPage)} />
      <Route path="pendencias" element={guard(isCuradorOuOperador(), ListaPendenciasScreen)} />

      <Route path="remessas/novo" element={guard(isCuradorOuOperador(), NovaRemessa)} />
      <Route path="remessas/:remessa_id" element={guard(isCuradorOuOperador(), NovaRemessa)} />
      <Route path="remessas" element={guard(isCuradorOuOperador(), ListaRemessasScreen)} />

      <Route path="usuarios/novo" element={guard(auth.can('create', 'Usuario'), NovoUsuario)} />
      <Route path="usuarios/:usuario_id" element={guard(auth.can('update', 'Usuario'), NovoUsuario)} />
      <Route path="usuarios" element={guard(auth.can('read', 'Usuario'), ListaUsuariosScreen)} />

      <Route path="identificadores/novo" element={guard(auth.can('create', 'Identificador'), NovoIdentificador)} />
      <Route
        path="identificadores/:identificador_id"
        element={guard(auth.can('update', 'Identificador'), NovoIdentificador)}
      />
      <Route path="identificadores" element={guard(auth.can('read', 'Identificador'), ListaIdentificadoresScreen)} />

      <Route path="herbarios/novo" element={guard(auth.can('create', 'Herbario'), NovoHerbario)} />
      <Route path="herbarios/:herbario_id" element={guard(auth.can('update', 'Herbario'), NovoHerbario)} />

      <Route path="coletores/novo" element={guard(auth.can('create', 'Coletor'), NovoColetor)} />
      <Route path="coletores/:coletor_id" element={guard(auth.can('update', 'Coletor'), NovoColetor)} />
      <Route path="coletores" element={guard(auth.can('read', 'Coletor'), ListaColetoresScreen)} />

      <Route path="herbarios" element={guard(Boolean(auth.user?.id), ListaHerbariosScreen)} />
      <Route path="fichas/tombos" element={guard(Boolean(auth.user?.id), FichaTomboScreen)} />
      <Route path="locais-coleta" element={guard(Boolean(auth.user?.id), ListaLocalColetaScreen)} />
      <Route path="estados" element={guard(Boolean(auth.user?.id), ListaEstadosScreen)} />
      <Route path="cidades" element={guard(Boolean(auth.user?.id), ListaCidadesScreen)} />

      <Route path="reflora" element={guard(auth.can('read', 'Reflora'), ServicosRefloraScreen)} />
      <Route path="specieslink" element={guard(auth.can('read', 'SpeciesLink'), ServicosSpeciesLinkScreen)} />
      <Route path="exportacao" element={guard(auth.can('export', 'Tombo'), ExportaçãoScreen)} />

      <Route path="livro-tombo" element={<LivroTomboScreen />} />
      <Route path="especies" element={<ListaTaxonomiaEspecie />} />
      <Route path="familias" element={<ListaTaxonomiaFamilia />} />
      <Route path="reinos" element={<ListaTaxonomiaReino />} />
      <Route path="generos" element={<ListaTaxonomiaGenero />} />
      <Route path="subespecies" element={<ListaTaxonomiaSubespecie />} />
      <Route path="subfamilias" element={<ListaTaxonomiaSubfamilia />} />
      <Route path="variedades" element={<ListaTaxonomiaVariedade />} />
      <Route path="autores" element={<ListaTaxonomiaAutores />} />
      <Route path="mapa" element={<Mapa />} />
      <Route path="filtros" element={<FiltrosMapaScreen />} />
      <Route path="perfil" element={<PerfilScreen />} />

      <Route path="relatorio-coleta-data" element={guard(Boolean(auth.user?.id), RelatorioColetaPeriodoScreen)} />
      <Route
        path="relatorio-inventario-especies"
        element={guard(Boolean(auth.user?.id), RelatorioInventarioEspeciesScreen)}
      />
      <Route path="relatorio-coletor-data" element={guard(Boolean(auth.user?.id), RelatorioColetorPeriodoScreen)} />
      <Route path="relatorio-codigo-barras" element={guard(Boolean(auth.user?.id), RelatorioCodigoBarrasScreen)} />
      <Route
        path="relatorio-familias-genero"
        element={guard(Boolean(auth.user?.id), RelatorioFamiliasGeneroScreen)}
      />
      <Route path="relatorio-locais-coleta" element={guard(Boolean(auth.user?.id), RelatorioLocalColetaScreen)} />
      <Route
        path="relatorio-quantidade-familia-generos"
        element={guard(Boolean(auth.user?.id), RelatorioQuantidadeScreen)}
      />
    </Routes>
  )
}
