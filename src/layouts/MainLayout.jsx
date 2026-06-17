import { Component } from 'react'

import {
    Layout, Menu, Col, Spin, Button, Row,
    Divider
} from 'antd'
import axios from 'axios'
import { withTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import {
    BarsOutlined, DatabaseOutlined, DesktopOutlined, FileTextOutlined, EnvironmentOutlined,
    FlagOutlined, LogoutOutlined, MenuUnfoldOutlined, SearchOutlined, TeamOutlined,
    SnippetsOutlined
} from '@ant-design/icons'

import logoImage from '../assets/img/logo_branca.png'
import { EnvBadge } from '../components/EnvBadge'

const { Header, Content, Sider } = Layout
const { SubMenu } = Menu

const APP_ENV = import.meta.env.VITE_APP_ENV ?? 'development'
const IS_PROD = APP_ENV === 'production'

const TAXONOMIA_RESOURCES = [
    'Reino',
    'Familia',
    'Subfamilia',
    'Genero',
    'Especie',
    'Subespecie',
    'Variedade',
    'Autor'
]

const SERVICOS_RESOURCES = [
    'Reflora',
    'SpeciesLink'
]

class MainLayout extends Component {
    constructor(props) {
        super(props)
        this.state = {
            collapsed: false,
            loading: false,
            openKeys: []
        }
    }

    componentDidMount() {
        document.title = IS_PROD ? 'HCF' : `HCF — ${APP_ENV.toUpperCase()}`
    }

    onOpenChange = openKeys => {
        this.setState({ openKeys })
    }

    toggle = () => {
        this.setState({
            // eslint-disable-next-line react-x/no-access-state-in-setstate
            collapsed: !this.state.collapsed
        })
    }

    requisitaDarwinCore = () => {
        this.setState({
            loading: true
        })
        axios.get('/darwincore')
            .then(response => {
                this.setState({
                    loading: false
                })
            })
            .catch(err => {
                this.setState({
                    loading: false
                })
                const { response } = err
                if (response && response.data) {
                    if (response.status === 400 || response.status === 422) {
                        this.notificacao('warning', this.props.t('common:tituloFalha'), response.data.error.message)
                    } else {
                        this.notificacao('error', this.props.t('common:tituloFalha'), this.props.t('mainLayout:erroBuscarDarwinCore'))
                    }
                    const { error } = response.data
                    throw new Error(error.message)
                } else {
                    throw err
                }
            })
            .catch(() => {
                this.notificacao('error', this.props.t('common:tituloFalha'), this.props.t('mainLayout:erroRequisitarDarwinCore'))
            })
    }

    renderFormulario() {
        return (
            <Layout style={{ minHeight: '100vh' }}>
                <Sider
                    trigger={null}
                    collapsible
                    collapsed={this.state.collapsed}
                    width={this.state.openKeys.includes('relatorios') ? 320 : 240}
                    collapsedWidth={80}
                >
                    <Col align="center" style={{ marginTop: 20, marginBottom: 20 }}>
                        <Link to="/dashboard">
                            <img
                                src={logoImage}
                                alt="logo-hcf"
                                height={this.state.collapsed ? '70px' : '120px'}
                                width={this.state.collapsed ? '70px' : '120px'}
                            />
                        </Link>
                    </Col>
                    <Menu
                        theme="dark"
                        mode="inline"
                        openKeys={this.state.openKeys}
                        onOpenChange={this.onOpenChange}
                    >
                        {this.props.auth.can('read', 'Tombo')
                            ? (
                                    <Menu.Item key="tomboMenuItem">
                                        <Link to="/tombos">
                                            <DesktopOutlined />
                                            <span>{this.props.t('mainLayout:tombos')}</span>
                                        </Link>
                                    </Menu.Item>
                                )
                            : null}
                        {TAXONOMIA_RESOURCES.some(resource => this.props.auth.can('read', resource))
                            ? (
                                    <SubMenu
                                        key="taxonomiaSubmenu"
                                        title={(
                                            <span>
                                                <DesktopOutlined />
                                                <span>{this.props.t('mainLayout:taxonomia')}</span>
                                            </span>
                                        )}
                                    >
                                        {this.props.auth.can('read', 'Reino')
                                            ? (
                                                    <Menu.Item key="reinoMenuItem">
                                                        <Link to="/reinos">{this.props.t('mainLayout:reinos')}</Link>
                                                    </Menu.Item>
                                                )
                                            : null}
                                        {this.props.auth.can('read', 'Familia')
                                            ? (
                                                    <Menu.Item key="familiaMenuItem">
                                                        <Link to="/familias">{this.props.t('mainLayout:familias')}</Link>
                                                    </Menu.Item>
                                                )
                                            : null}
                                        {this.props.auth.can('read', 'Subfamilia')
                                            ? (
                                                    <Menu.Item key="subfamiliaMenuItem">
                                                        <Link to="/subfamilias">{this.props.t('mainLayout:subfamilias')}</Link>
                                                    </Menu.Item>
                                                )
                                            : null}
                                        {this.props.auth.can('read', 'Genero')
                                            ? (
                                                    <Menu.Item key="generoMenuItem">
                                                        <Link to="/generos">{this.props.t('mainLayout:generos')}</Link>
                                                    </Menu.Item>
                                                )
                                            : null}
                                        {this.props.auth.can('read', 'Especie')
                                            ? (
                                                    <Menu.Item key="especieMenuItem">
                                                        <Link to="/especies">{this.props.t('mainLayout:especies')}</Link>
                                                    </Menu.Item>
                                                )
                                            : null}
                                        {this.props.auth.can('read', 'Subespecie')
                                            ? (
                                                    <Menu.Item key="subespecieMenuItem">
                                                        <Link to="/subespecies">{this.props.t('mainLayout:subespecies')}</Link>
                                                    </Menu.Item>
                                                )
                                            : null}
                                        {this.props.auth.can('read', 'Variedade')
                                            ? (
                                                    <Menu.Item key="variedadeMenuItem">
                                                        <Link to="/variedades">{this.props.t('mainLayout:variedades')}</Link>
                                                    </Menu.Item>
                                                )
                                            : null}
                                        {this.props.auth.can('read', 'Autor')
                                            ? (
                                                    <Menu.Item key="autorMenuItem">
                                                        <Link to="/autores">{this.props.t('mainLayout:autores')}</Link>
                                                    </Menu.Item>
                                                )
                                            : null}
                                    </SubMenu>
                                )
                            : null}
                        <SubMenu
                            key="locaisSubmenu"
                            title={(
                                <span>
                                    <EnvironmentOutlined />
                                    <span>{this.props.t('mainLayout:locais')}</span>
                                </span>
                            )}
                        >
                            <Menu.Item key="estadoMenuItem">
                                <Link to="/estados">{this.props.t('mainLayout:estados')}</Link>
                            </Menu.Item>
                            <Menu.Item key="cidadeMenuItem">
                                <Link to="/cidades">{this.props.t('mainLayout:cidades')}</Link>
                            </Menu.Item>
                            {this.props.auth.loggedIn
                                ? (
                                        <Menu.Item key="localColetaMenuItem">
                                            <Link to="/locais-coleta">
                                                <span>{this.props.t('mainLayout:localColeta')}</span>
                                            </Link>
                                        </Menu.Item>
                                    )
                                : null}
                        </SubMenu>
                        {this.props.auth.can(['read'], 'Remessa')
                            ? (
                                    <Menu.Item key="remessaMenuItem">
                                        <Link to="/remessas">
                                            <DatabaseOutlined />
                                            <span>{this.props.t('mainLayout:remessas')}</span>
                                        </Link>
                                    </Menu.Item>
                                )
                            : null}
                        {this.props.auth.can('read', 'Pendencia')
                            ? (
                                    <Menu.Item key="pendenciaMenuItem">
                                        <Link to="/pendencias">
                                            <BarsOutlined />
                                            <span>{this.props.t('mainLayout:pendencias')}</span>
                                        </Link>
                                    </Menu.Item>
                                )
                            : null}
                        {this.props.auth.can('read', 'Usuario')
                            ? (
                                    <Menu.Item key="usuarioMenuItem">
                                        <Link to="/usuarios">
                                            <TeamOutlined />
                                            <span>{this.props.t('mainLayout:usuarios')}</span>
                                        </Link>
                                    </Menu.Item>
                                )
                            : null}
                        {this.props.auth.can('read', 'Identificador')
                            ? (
                                    <Menu.Item key="identificadorMenuItem">
                                        <Link to="/identificadores">
                                            <TeamOutlined />
                                            <span>{this.props.t('mainLayout:identificadores')}</span>
                                        </Link>
                                    </Menu.Item>
                                )
                            : null}
                        {this.props.auth.can('read', 'Coletor')
                            ? (
                                    <Menu.Item key="coletorMenuItem">
                                        <Link to="/coletores">
                                            <TeamOutlined />
                                            <span>{this.props.t('mainLayout:coletores')}</span>
                                        </Link>
                                    </Menu.Item>
                                )
                            : null}
                        {this.props.auth.loggedIn
                            ? (
                                    <Menu.Item key="herbarioMenuItem">
                                        <Link to="/herbarios">
                                            <FlagOutlined />
                                            <span>{this.props.t('mainLayout:herbarios')}</span>
                                        </Link>
                                    </Menu.Item>
                                )
                            : null}
                        {this.props.auth.loggedIn
                            ? (
                                    <SubMenu
                                        key="fichasSubmenu"
                                        title={(
                                            <span>
                                                <FileTextOutlined />
                                                <span>{this.props.t('mainLayout:fichas')}</span>
                                            </span>
                                        )}
                                    >
                                        <Menu.Item key="fichaTomboMenuItem">
                                            {' '}
                                            <Link to="/fichas/tombos">{this.props.t('mainLayout:fichaTombo')}</Link>
                                            {' '}
                                        </Menu.Item>
                                    </SubMenu>
                                )
                            : null}

                        <SubMenu
                            key="geolocalizacaoSubmenu"
                            title={(
                                <span>
                                    <EnvironmentOutlined />
                                    <span>{this.props.t('mainLayout:geolocalizacao')}</span>
                                </span>
                            )}
                        >
                            <Menu.Item key="mapaMenuItem">
                                <Link to="/mapa">{this.props.t('mainLayout:mapaCompleto')}</Link>
                            </Menu.Item>
                            <Menu.Item key="filtroAvancadoMenuItem">
                                <Link to="/filtros">{this.props.t('mainLayout:filtrosAvancados')}</Link>
                            </Menu.Item>
                        </SubMenu>
                        {this.props.auth.loggedIn
                            ? (
                                    <SubMenu
                                        key="relatorios"
                                        title={(
                                            <span>
                                                <SnippetsOutlined />
                                                <span>{this.props.t('mainLayout:relatorios')}</span>
                                            </span>
                                        )}
                                    >
                                        <Menu.Item key="relatorioPorPeriodoMenuItem">
                                            <Link to="/relatorio-por-periodo">{this.props.t('mainLayout:relatorioPorPeriodo')}</Link>
                                        </Menu.Item>
                                        <Menu.Item key="relatorioInventarioEspeciesMenuItem">
                                            <Link to="/relatorio-inventario-especies">{this.props.t('mainLayout:inventarioEspecies')}</Link>
                                        </Menu.Item>
                                        <Menu.Item key="relatorioColetaDataMenuItem">
                                            <Link to="/relatorio-coleta-data">{this.props.t('mainLayout:coletaIntervaloData')}</Link>
                                        </Menu.Item>
                                        <Menu.Item key="relatorioColetorDataMenuItem">
                                            <Link to="/relatorio-coletor-data">{this.props.t('mainLayout:coletaColetorIntervaloData')}</Link>
                                        </Menu.Item>
                                        <Menu.Item key="relatorioFamiliasGeneroMenuItem">
                                            <Link to="/relatorio-familias-genero">{this.props.t('mainLayout:familiasGeneros')}</Link>
                                        </Menu.Item>
                                        <Menu.Item key="relatorioLocaisColetaMenuItem">
                                            <Link to="/relatorio-locais-coleta">{this.props.t('mainLayout:locaisColeta')}</Link>
                                        </Menu.Item>
                                        <Menu.Item key="relatorioTombosPorCidadeMenuItem">
                                            <Link to="/relatorio-tombos-por-cidade">{this.props.t('mainLayout:tombosPorCidade')}</Link>
                                        </Menu.Item>
                                        <Menu.Item key="relatorioQuantidadeFamiliaGenerosMenuItem">
                                            <Link to="/relatorio-quantidade-familia-generos">
                                                {this.props.t('mainLayout:quantidadeFamiliaGenero')}
                                            </Link>
                                        </Menu.Item>
                                        <Menu.Item key="relatorioCodigoBarrasMenuItem">
                                            <Link to="/relatorio-codigo-barras">{this.props.t('mainLayout:codigoBarras')}</Link>
                                        </Menu.Item>
                                        <Menu.Item key="relatorioCoordenadaForaPoligonoMenuItem">
                                            <Link to="/relatorio-coordenadas-fora-poligono">
                                                {this.props.t('mainLayout:diagnosticoErrosPosicionamento')}
                                            </Link>
                                        </Menu.Item>
                                    </SubMenu>
                                )
                            : null}
                        {this.props.auth.can('export', 'Tombo')
                            ? (
                                    <Menu.Item key="exportacaoMenuItem">
                                        <Link to="/exportacao">
                                            <DesktopOutlined />
                                            <span>{this.props.t('mainLayout:exportacao')}</span>
                                        </Link>
                                    </Menu.Item>
                                )
                            : null}
                        {SERVICOS_RESOURCES.some(resource => this.props.auth.can('read', resource))
                            ? (
                                    <SubMenu
                                        key="servicoSubmenu"
                                        title={(
                                            <span>
                                                {' '}
                                                <SearchOutlined />
                                                {' '}
                                                <span>{this.props.t('mainLayout:servicos')}</span>
                                                {' '}
                                            </span>
                                        )}
                                    >
                                        {this.props.auth.can('read', 'Reflora')
                                            ? (
                                                    <Menu.Item key="refloraMenuItem">
                                                        <Link to="/reflora">Reflora</Link>
                                                    </Menu.Item>
                                                )
                                            : null}
                                        {this.props.auth.can('read', 'SpeciesLink')
                                            ? (
                                                    <Menu.Item key="specieslinkMenuItem">
                                                        <Link to="/specieslink">speciesLink</Link>
                                                    </Menu.Item>
                                                )
                                            : null}
                                    </SubMenu>
                                )
                            : null}
                        {this.props.auth.loggedIn
                            ? (
                                    <Menu.Item key="sairMenuItem">
                                        <Link
                                            to="/inicio"
                                            onClick={this.props.logOut}
                                        >
                                            <LogoutOutlined />
                                            <span>{this.props.t('common:sair')}</span>
                                        </Link>
                                    </Menu.Item>
                                )
                            : null}
                    </Menu>
                </Sider>
                <Layout>
                    <Header style={{ background: '#fff' }}>
                        <Row type="flex" justify="space-between" align="middle">
                            <div style={{ cursor: 'pointer' }}>
                                <MenuUnfoldOutlined onClick={this.toggle} />
                            </div>
                            {!IS_PROD && <EnvBadge env={APP_ENV} />}
                            {this.props.auth.loggedIn
                                ? (
                                        <div>
                                            {this.props.auth.user?.nome}

                                            <Divider type="vertical" />

                                            <Link to="/perfil">
                                                <Button size="small">{this.props.t('common:perfil')}</Button>
                                            </Link>

                                            <Divider type="vertical" />

                                            <Link
                                                to="/inicio"
                                                onClick={this.props.logOut}
                                            >
                                                <Button size="small">{this.props.t('common:sair')}</Button>
                                            </Link>
                                        </div>
                                    )
                                : (
                                        <Link to="/inicio">
                                            <Button>{this.props.t('common:sair')}</Button>
                                        </Link>
                                    )}
                        </Row>
                    </Header>
                    <Content
                        style={{
                            margin: '24px 16px',
                            padding: 24,
                            background: '#fdfdfd',
                            minHeight: 280
                        }}
                    >
                        {this.props.children}
                    </Content>
                </Layout>

            </Layout>
        )
    }

    render() {
        if (this.state.loading) {
            return (
                <Spin tip="Carregando...">
                    {this.renderFormulario()}
                </Spin>
            )
        }
        return (
            this.renderFormulario()
        )
    }
}

const MainLayoutWithTranslation = withTranslation()(MainLayout)
export default MainLayoutWithTranslation
