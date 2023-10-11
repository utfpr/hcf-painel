import { Component } from 'react'

import {
    BrowserRouter, Switch, Route,
    Redirect
} from 'react-router-dom'

import {
    setUsuario,
    setTokenUsuario,
    isCurador,
    isCuradorOuOperador,
    isCuradorOuOperadorOuIdentificador
} from './helpers/usuarios'
import MainLayout from './layouts/MainLayout'
import DetalhesTomboScreen from './pages/DetalhesTomboScreen'
import FichaTomboScreen from './pages/FichaTomboScreen'
import InicioScreen from './pages/InicioScreen'
import ListaHerbariosScreen from './pages/ListaHerbariosScreen'
import ListaPendenciasScreen from './pages/ListaPendenciasScreen'
import ListaRemessasScreen from './pages/ListaRemessasScreen'
import ListaTaxonomiaAutores from './pages/ListaTaxonomiaAutores'
import ListaTaxonomiaEspecie from './pages/ListaTaxonomiaEspecie'
import ListaTaxonomiaFamilia from './pages/ListaTaxonomiaFamilia'
import ListaTaxonomiaGenero from './pages/ListaTaxonomiaGenero'
import ListaTaxonomiaScreen from './pages/ListaTaxonomiaScreen'
import ListaTaxonomiaSubespecie from './pages/ListaTaxonomiaSubespecie'
import ListaTaxonomiaSubfamilia from './pages/ListaTaxonomiaSubfamilia'
import ListaTaxonomiaVariedade from './pages/ListaTaxonomiaVariedade'
import ListaTombosScreen from './pages/ListaTombosScreen'
import ListaUsuariosScreen from './pages/ListaUsuariosScreen'
import LivroTomboScreen from './pages/LivroTomboScreen'
import NovaRemessaScreen from './pages/NovaRemessaScreen'
import NovoHerbarioScreen from './pages/NovoHerbarioScreen'
import NovoTomboScreen from './pages/NovoTomboScreen'
import NovoUsuarioScreen from './pages/NovoUsuarioScreen'
import ServicosRefloraScreen from './pages/ServicosRefloraScreen'
import ServicosSpeciesLinkScreen from './pages/ServicosSpeciesLinkScreen'
import PendenciaPagina from './pages/VerPendenciaScreen'

import 'antd/dist/antd.css'
import './assets/css/App.css'
import './assets/css/FormEnterSystem.css'
import './assets/css/Main.css'
import './assets/css/Search.css'
import 'react-image-gallery/styles/scss/image-gallery.scss'
import 'react-image-gallery/styles/css/image-gallery.css'
import 'react-image-gallery/styles/scss/image-gallery-no-icon.scss'
import 'react-image-gallery/styles/css/image-gallery-no-icon.css'

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
    constructor() {
        super()

        const token = localStorage.getItem('token')
        setTokenUsuario(token)

        const usuario = localStorage.getItem('usuario')
        if (usuario) {
            setUsuario(JSON.parse(usuario))
        }
    }

    renderContent = () => (
        <MainLayout>
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
                <PrivateRoute authed={isCurador()} path="/usuarios/novo" component={NovoUsuarioScreen} />
                <PrivateRoute authed={isCurador()} path="/usuarios/:usuario_id" component={NovoUsuarioScreen} />
                <PrivateRoute authed={isCurador()} path="/usuarios" component={ListaUsuariosScreen} />
                <PrivateRoute authed={isCurador()} path="/herbarios/novo" component={NovoHerbarioScreen} />
                <PrivateRoute authed={isCurador()} path="/herbarios/:herbario_id" component={NovoHerbarioScreen} />

                <Route path="/herbarios" component={ListaHerbariosScreen} />
                <Route path="/fichas/tombos" component={FichaTomboScreen} />
                <PrivateRoute authed={isCurador()} path="/reflora" component={ServicosRefloraScreen} />
                <PrivateRoute authed={isCurador()} path="/specieslink" component={ServicosSpeciesLinkScreen} />

                <Route path="/livro-tombo" component={LivroTomboScreen} />
                <Route path="/especies" component={ListaTaxonomiaEspecie} />
                <Route path="/familias" component={ListaTaxonomiaFamilia} />
                <Route path="/generos" component={ListaTaxonomiaGenero} />
                <Route path="/subespecies" component={ListaTaxonomiaSubespecie} />
                <Route path="/subfamilias" component={ListaTaxonomiaSubfamilia} />
                <Route path="/variedades" component={ListaTaxonomiaVariedade} />
                <Route path="/autores" component={ListaTaxonomiaAutores} />
            </Switch>
        </MainLayout>
    )

    render() {
        return (
            <BrowserRouter>
                <Switch>
                    <Route path="/inicio" component={InicioScreen} />
                    <Route path="/" render={this.renderContent} />
                </Switch>
            </BrowserRouter>
        )
    }
}
