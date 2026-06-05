import { Component } from 'react'

import {
    Layout, Menu, Col, Spin, Button, Row,
    Divider
} from 'antd'
import axios from 'axios'
import { Link } from 'react-router-dom'

import i18n from '@/i18n'
import {
    BarsOutlined, DatabaseOutlined, DesktopOutlined, FileTextOutlined, EnvironmentOutlined,
    FlagOutlined, LogoutOutlined, MenuUnfoldOutlined, SearchOutlined, TeamOutlined,
    SnippetsOutlined
} from '@ant-design/icons'

import logoImage from '../assets/img/logo_branca.png'
import { EnvBadge } from '../components/EnvBadge'

const t = i18n.t

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

export default class MainLayout extends Component {
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
                        this.notificacao('warning', t('mainLayout:tituloFalha'), response.data.error.message)
                    } else {
                        this.notificacao('error', t('mainLayout:tituloFalha'), t('mainLayout:erroBuscarDarwinCore'))
                    }
                    const { error } = response.data
                    throw new Error(error.message)
                } else {
                    throw err
                }
            })
            .catch(() => {
                this.notificacao('error', t('mainLayout:tituloFalha'), t('mainLayout:erroRequisitarDarwinCore'))
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
                        <Link to="/">
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
                                            <span>{t('mainLayout:tombos')}</span>
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
                                                <span>{t('mainLayout:taxonomia')}</span>
                                            </span>
                                        )}
                                    >
                                        {this.props.auth.can('read', 'Reino')
                                            ? (
                                                    <Menu.Item key="reinoMenuItem">
                                                        <Link to="/reinos">{t('mainLayout:reinos')}</Link>
                                                    </Menu.Item>
                                                )
                                            : null}
                                        {this.props.auth.can('read', 'Familia')
                                            ? (
                                                    <Menu.Item key="familiaMenuItem">
                                                        <Link to="/familias">{t('mainLayout:familias')}</Link>
                                                    </Menu.Item>
                                                )
                                            : null}
                                        {this.props.auth.can('read', 'Subfamilia')
                                            ? (
                                                    <Menu.Item key="subfamiliaMenuItem">
                                                        <Link to="/subfamilias">{t('mainLayout:subfamilias')}</Link>
                                                    </Menu.Item>
                                                )
                                            : null}
                                        {this.props.auth.can('read', 'Genero')
                                            ? (
                                                    <Menu.Item key="generoMenuItem">
                                                        <Link to="/generos">{t('mainLayout:generos')}</Link>
                                                    </Menu.Item>
                                                )
                                            : null}
                                        {this.props.auth.can('read', 'Especie')
                                            ? (
                                                    <Menu.Item key="especieMenuItem">
                                                        <Link to="/especies">{t('mainLayout:especies')}</Link>
                                                    </Menu.Item>
                                                )
                                            : null}
                                        {this.props.auth.can('read', 'Subespecie')
                                            ? (
                                                    <Menu.Item key="subespecieMenuItem">
                                                        <Link to="/subespecies">{t('mainLayout:subespecies')}</Link>
                                                    </Menu.Item>
                                                )
                                            : null}
                                        {this.props.auth.can('read', 'Variedade')
                                            ? (
                                                    <Menu.Item key="variedadeMenuItem">
                                                        <Link to="/variedades">{t('mainLayout:variedades')}</Link>
                                                    </Menu.Item>
                                                )
                                            : null}
                                        {this.props.auth.can('read', 'Autor')
                                            ? (
                                                    <Menu.Item key="autorMenuItem">
                                                        <Link to="/autores">{t('mainLayout:autores')}</Link>
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
                                    <span>{t('mainLayout:locais')}</span>
                                </span>
                            )}
                        >
                            <Menu.Item key="estadoMenuItem">
                                <Link to="/estados">{t('mainLayout:estados')}</Link>
                            </Menu.Item>
                            <Menu.Item key="cidadeMenuItem">
                                <Link to="/cidades">{t('mainLayout:cidades')}</Link>
                            </Menu.Item>
                            {this.props.auth.loggedIn
                                ? (
                                        <Menu.Item key="localColetaMenuItem">
                                            <Link to="/locais-coleta">
                                                <span>{t('mainLayout:localColeta')}</span>
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
                                            <span>{t('mainLayout:remessas')}</span>
                                        </Link>
                                    </Menu.Item>
                                )
                            : null}
                        {this.props.auth.can('read', 'Pendencia')
                            ? (
                                    <Menu.Item key="pendenciaMenuItem">
                                        <Link to="/pendencias">
                                            <BarsOutlined />
                                            <span>{t('mainLayout:pendencias')}</span>
                                        </Link>
                                    </Menu.Item>
                                )
                            : null}
                        {this.props.auth.can('read', 'Usuario')
                            ? (
                                    <Menu.Item key="usuarioMenuItem">
                                        <Link to="/usuarios">
                                            <TeamOutlined />
                                            <span>{t('mainLayout:usuarios')}</span>
                                        </Link>
                                    </Menu.Item>
                                )
                            : null}
                        {this.props.auth.can('read', 'Identificador')
                            ? (
                                    <Menu.Item key="identificadorMenuItem">
                                        <Link to="/identificadores">
                                            <TeamOutlined />
                                            <span>{t('mainLayout:identificadores')}</span>
                                        </Link>
                                    </Menu.Item>
                                )
                            : null}
                        {this.props.auth.can('read', 'Coletor')
                            ? (
                                    <Menu.Item key="coletorMenuItem">
                                        <Link to="/coletores">
                                            <TeamOutlined />
                                            <span>{t('mainLayout:coletores')}</span>
                                        </Link>
                                    </Menu.Item>
                                )
                            : null}
                        {this.props.auth.loggedIn
                            ? (
                                    <Menu.Item key="herbarioMenuItem">
                                        <Link to="/herbarios">
                                            <FlagOutlined />
                                            <span>{t('mainLayout:herbarios')}</span>
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
                                                <span>{t('mainLayout:fichas')}</span>
                                            </span>
                                        )}
                                    >
                                        <Menu.Item key="fichaTomboMenuItem">
                                            {' '}
                                            <Link to="/fichas/tombos">{t('mainLayout:fichaTombo')}</Link>
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
                                    <span>{t('mainLayout:geolocalizacao')}</span>
                                </span>
                            )}
                        >
                            <Menu.Item key="mapaMenuItem">
                                <Link to="/mapa">{t('mainLayout:mapaCompleto')}</Link>
                            </Menu.Item>
                            <Menu.Item key="filtroAvancadoMenuItem">
                                <Link to="/filtros">{t('mainLayout:filtrosAvancados')}</Link>
                            </Menu.Item>
                        </SubMenu>
                        {this.props.auth.loggedIn
                            ? (
                                    <SubMenu
                                        key="relatorios"
                                        title={(
                                            <span>
                                                <SnippetsOutlined />
                                                <span>{t('mainLayout:relatorios')}</span>
                                            </span>
                                        )}
                                    >
                                        <Menu.Item key="relatorioPorPeriodoMenuItem">
                                            <Link to="/relatorio-por-periodo">{t('mainLayout:relatorioPorPeriodo')}</Link>
                                        </Menu.Item>
                                        <Menu.Item key="relatorioInventarioEspeciesMenuItem">
                                            <Link to="/relatorio-inventario-especies">{t('mainLayout:inventarioEspecies')}</Link>
                                        </Menu.Item>
                                        <Menu.Item key="relatorioColetaDataMenuItem">
                                            <Link to="/relatorio-coleta-data">{t('mainLayout:coletaIntervaloData')}</Link>
                                        </Menu.Item>
                                        <Menu.Item key="relatorioColetorDataMenuItem">
                                            <Link to="/relatorio-coletor-data">{t('mainLayout:coletaColetorIntervaloData')}</Link>
                                        </Menu.Item>
                                        <Menu.Item key="relatorioFamiliasGeneroMenuItem">
                                            <Link to="/relatorio-familias-genero">{t('mainLayout:familiasGeneros')}</Link>
                                        </Menu.Item>
                                        <Menu.Item key="relatorioLocaisColetaMenuItem">
                                            <Link to="/relatorio-locais-coleta">{t('mainLayout:locaisColeta')}</Link>
                                        </Menu.Item>
                                        <Menu.Item key="relatorioTombosPorCidadeMenuItem">
                                            <Link to="/relatorio-tombos-por-cidade">{t('mainLayout:tombosPorCidade')}</Link>
                                        </Menu.Item>
                                        <Menu.Item key="relatorioQuantidadeFamiliaGenerosMenuItem">
                                            <Link to="/relatorio-quantidade-familia-generos">
                                                {t('mainLayout:quantidadeFamiliaGenero')}
                                            </Link>
                                        </Menu.Item>
                                        <Menu.Item key="relatorioCodigoBarrasMenuItem">
                                            <Link to="/relatorio-codigo-barras">{t('mainLayout:codigoBarras')}</Link>
                                        </Menu.Item>
                                        <Menu.Item key="relatorioCoordenadaForaPoligonoMenuItem">
                                            <Link to="/relatorio-coordenadas-fora-poligono">
                                                {t('mainLayout:diagnosticoErrosPosicionamento')}
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
                                            <span>{t('mainLayout:exportacao')}</span>
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
                                                <span>{t('mainLayout:servicos')}</span>
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
                                            <span>{t('common:sair')}</span>
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
                                                <Button size="small">{t('common:perfil')}</Button>
                                            </Link>

                                            <Divider type="vertical" />

                                            <Link
                                                to="/inicio"
                                                onClick={this.props.logOut}
                                            >
                                                <Button size="small">{t('common:sair')}</Button>
                                            </Link>
                                        </div>
                                    )
                                : (
                                        <Link to="/inicio">
                                            <Button>{t('common:sair')}</Button>
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
