import { Component } from 'react'

import 'antd/dist/antd.css'
import './assets/css/antd-theme.css'
import './assets/css/App.css'
import './assets/css/FormEnterSystem.css'
import './assets/css/Main.css'
import './assets/css/Search.css'
import 'react-image-gallery/styles/css/image-gallery.css'

import {
    BrowserRouter, Switch, Route,
    Redirect
} from 'react-router-dom'

import InicioScreen from './features/login/InicioScreen'
import {
    isCurador,
    isCuradorOuOperador,
    isCuradorOuOperadorOuIdentificador
} from './helpers/usuarios'
import MainLayout from './layouts/MainLayout'
import DetalhesTomboScreen from './pages/DetalhesTomboScreen'
import ExportaçãoScreen from './pages/ExportaçãoScreen'
import FichaTomboScreen from './pages/FichaTomboScreen'
import filtrosMapa from './pages/FiltrosMapa'
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
import ListaUsuariosScreen from './pages/ListaUsuariosScreen'
import LivroTomboScreen from './pages/LivroTomboScreen'
import Mapa from './pages/Mapa'
import NovaRemessaScreen from './pages/NovaRemessaScreen'
import NovoColetorScreen from './pages/NovoColetorScreen'
import NovoHerbarioScreen from './pages/NovoHerbarioScreen'
import NovoIdentificadorScreen from './pages/NovoIdentificadorScreen'
import NovoUsuarioScreen from './pages/NovoUsuarioScreen'
import PerfilScreen from './pages/PerfilScreen'
import RecuperarSenhaScreen from './pages/recuperacaoSenha/RecuperarSenhaScreen'
import ResetSenhaScreen from './pages/recuperacaoSenha/ResetSenhaScreen'
import RelatorioCodigoBarrasScreen from './pages/RelatorioCodigoBarrasScreen'
import RelatorioColetaPeriodoScreen from './pages/RelatorioColetaPeriodoScreen'
import RelatorioColetorPeriodoScreen from './pages/RelatorioColetorPeriodoScreen'
import RelatorioFamiliasGeneroScreen from './pages/RelatorioFamiliasGeneroScreen'
import RelatorioInventarioEspeciesScreen from './pages/RelatorioInventarioEspeciesScreen'
import RelatorioLocalColetaScreen from './pages/RelatorioLocalColetaPeriodoScreen'
import RelatorioQuantidadeScreen from './pages/RelatorioQtdPeriodoScreen'
import ServicosRefloraScreen from './pages/ServicosRefloraScreen'
import ServicosSpeciesLinkScreen from './pages/ServicosSpeciesLinkScreen'
import NovoTomboScreen from './pages/tombos/NovoTomboScreen'
import PendenciaPagina from './pages/VerPendenciaScreen'

const PrivateRoute = ({ component: Component, authed, ...rest }) => {
    return (
        <Route
            {...rest}
            render={props => (authed === true
                ? <Component {...props} />
                : <Redirect to={{ pathname: '/inicio', state: { from: props.location } }} />)}
        />
    )
}

export default class App extends Component {
    renderContent = () => (
        <MainLayout {...this.props}>
            <Switch>
                <Route path="/tombos/detalhes/:tombo_id" component={DetalhesTomboScreen} />
                <PrivateRoute authed={isCuradorOuOperador()} path="/tombos/novo" component={NovoTomboScreen} />
                <PrivateRoute
                    authed={isCuradorOuOperadorOuIdentificador()}
                    path="/tombos/:tombo_id"
                    component={NovoTomboScreen}
                />
                <Route exact path="/tombos" component={ListaTombosScreen} />
                <Route path="/taxonomias" component={ListaTaxonomiaScreen} />
                <PrivateRoute
                    authed={isCuradorOuOperador()}
                    path="/pendencias/:pendencia_id"
                    component={PendenciaPagina}
                />
                <PrivateRoute
                    authed={isCuradorOuOperador()}
                    path="/pendencias"
                    component={ListaPendenciasScreen}
                />
                <PrivateRoute authed={isCuradorOuOperador()} path="/remessas/novo" component={NovaRemessaScreen} />
                <PrivateRoute
                    authed={isCuradorOuOperador()}
                    path="/remessas/:remessa_id"
                    component={NovaRemessaScreen}
                />
                <PrivateRoute authed={isCuradorOuOperador()} path="/remessas" component={ListaRemessasScreen} />
                <PrivateRoute
                    authed={this.props.auth.can('create', 'Usuario')}
                    path="/usuarios/novo"
                    component={NovoUsuarioScreen}
                />
                <PrivateRoute
                    authed={this.props.auth.can('update', 'Usuario')}
                    path="/usuarios/:usuario_id"
                    component={NovoUsuarioScreen}
                />
                <PrivateRoute
                    authed={this.props.auth.can('read', 'Usuario')}
                    path="/usuarios"
                    component={ListaUsuariosScreen}
                />
                <PrivateRoute
                    authed={this.props.auth.can('create', 'Identificador')}
                    path="/identificadores/novo"
                    component={NovoIdentificadorScreen}
                />
                <PrivateRoute
                    authed={this.props.auth.can('update', 'Identificador')}
                    path="/identificadores/:identificador_id"
                    component={NovoIdentificadorScreen}
                />
                <PrivateRoute
                    authed={this.props.auth.can('read', 'Identificador')}
                    path="/identificadores"
                    component={ListaIdentificadoresScreen}
                />
                <PrivateRoute
                    authed={this.props.auth.can('create', 'Herbario')}
                    path="/herbarios/novo"
                    component={NovoHerbarioScreen}
                />
                <PrivateRoute
                    authed={this.props.auth.can('update', 'Herbario')}
                    path="/herbarios/:herbario_id"
                    component={NovoHerbarioScreen}
                />
                <PrivateRoute
                    authed={this.props.auth.can('create', 'Coletor')}
                    path="/coletores/novo"
                    component={NovoColetorScreen}
                />
                <PrivateRoute
                    authed={this.props.auth.can('update', 'Coletor')}
                    path="/coletores/:coletor_id"
                    component={NovoColetorScreen}
                />
                <PrivateRoute
                    authed={this.props.auth.can('read', 'Coletor')}
                    path="/coletores"
                    component={ListaColetoresScreen}
                />
                <PrivateRoute
                    authed={Boolean(this.props.auth.user?.id)}
                    path="/herbarios"
                    component={ListaHerbariosScreen}
                />
                <PrivateRoute
                    authed={Boolean(this.props.auth.user?.id)}
                    path="/fichas/tombos"
                    component={FichaTomboScreen}
                />
                <PrivateRoute
                    authed={Boolean(this.props.auth.user?.id)}
                    path="/locais-coleta"
                    component={ListaLocalColetaScreen}
                />
                <PrivateRoute
                    authed={Boolean(this.props.auth.user?.id)}
                    path="/estados"
                    component={ListaEstadosScreen}
                />
                <PrivateRoute
                    authed={Boolean(this.props.auth.user?.id)}
                    path="/cidades"
                    component={ListaCidadesScreen}
                />
                <PrivateRoute
                    authed={this.props.auth.can('read', 'Reflora')}
                    path="/reflora"
                    component={ServicosRefloraScreen}
                />
                <PrivateRoute
                    authed={this.props.auth.can('read', 'SpeciesLink')}
                    path="/specieslink"
                    component={ServicosSpeciesLinkScreen}
                />
                <PrivateRoute
                    authed={this.props.auth.can('export', 'Tombo')}
                    path="/exportacao"
                    component={ExportaçãoScreen}
                />

                <Route path="/livro-tombo" component={LivroTomboScreen} />
                <Route path="/especies" component={ListaTaxonomiaEspecie} />
                <Route path="/familias" component={ListaTaxonomiaFamilia} />
                <Route path="/reinos" component={ListaTaxonomiaReino} />
                <Route path="/generos" component={ListaTaxonomiaGenero} />
                <Route path="/subespecies" component={ListaTaxonomiaSubespecie} />
                <Route path="/subfamilias" component={ListaTaxonomiaSubfamilia} />
                <Route path="/variedades" component={ListaTaxonomiaVariedade} />
                <Route path="/autores" component={ListaTaxonomiaAutores} />
                <Route path="/mapa" component={Mapa} />
                <Route path="/filtros" component={filtrosMapa} />
                <Route path="/perfil" component={PerfilScreen} />

                <PrivateRoute
                    authed={Boolean(this.props.auth.user?.id)}
                    path="/relatorio-coleta-data"
                    component={RelatorioColetaPeriodoScreen}
                />
                <PrivateRoute
                    authed={Boolean(this.props.auth.user?.id)}
                    path="/relatorio-inventario-especies"
                    component={RelatorioInventarioEspeciesScreen}
                />
                <PrivateRoute
                    authed={Boolean(this.props.auth.user?.id)}
                    path="/relatorio-coletor-data"
                    component={RelatorioColetorPeriodoScreen}
                />
                <PrivateRoute
                    authed={Boolean(this.props.auth.user?.id)}
                    path="/relatorio-codigo-barras"
                    component={RelatorioCodigoBarrasScreen}
                />
                <PrivateRoute
                    authed={Boolean(this.props.auth.user?.id)}
                    path="/relatorio-familias-genero"
                    component={RelatorioFamiliasGeneroScreen}
                />
                <PrivateRoute
                    authed={Boolean(this.props.auth.user?.id)}
                    path="/relatorio-locais-coleta"
                    component={RelatorioLocalColetaScreen}
                />
                <PrivateRoute
                    authed={Boolean(this.props.auth.user?.id)}
                    path="/relatorio-quantidade-familia-generos"
                    component={RelatorioQuantidadeScreen}
                />
            </Switch>
        </MainLayout>
    )

    render() {
        return (
            <BrowserRouter basename={import.meta.env.VITE_BASE_URL}>
                <Switch>
                    <Route path="/reset-senha" component={ResetSenhaScreen} />
                    <Route path="/recuperar-senha" component={RecuperarSenhaScreen} />
                    <Route path="/inicio" component={InicioScreen} />
                    <Route path="/" render={this.renderContent} />
                </Switch>
            </BrowserRouter>
        )
    }
}
