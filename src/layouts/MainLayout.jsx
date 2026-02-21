import { Component } from 'react'

import {
    Layout, Menu, Col, Spin, Button, Row,
    Divider
} from 'antd'
import axios from 'axios'
import { Link } from 'react-router-dom'

import {
    BarsOutlined, DatabaseOutlined, DesktopOutlined, FileTextOutlined, EnvironmentOutlined,
    FlagOutlined, LogoutOutlined, MenuUnfoldOutlined, SearchOutlined, TeamOutlined,
    SnippetsOutlined
} from '@ant-design/icons'

import logoImage from '../assets/img/logo_branca.png'
import { baseUrl } from '../config/api'

const { Header, Content, Sider } = Layout
const { SubMenu } = Menu

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

export default class MainLayout extends Component {
    constructor(props) {
        super(props)
        this.state = {
            collapsed: false,
            loading: false,
            userName: '',
            openKeys: []
        }
    }

    onOpenChange = openKeys => {
        this.setState({ openKeys })
    }

    toggle = () => {
        this.setState({
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
                        this.notificacao('warning', 'Falha', response.data.error.message)
                    } else {
                        this.notificacao('error', 'Falha', 'Houve um problema ao buscar o arquivo Darwin Core, tente novamente.')
                    }
                    const { error } = response.data
                    throw new Error(error.message)
                } else {
                    throw err
                }
            })
            .catch(() => {
                this.notificacao('error', 'Falha', 'Houve um problema ao requisitar o arquivo Darwin Core, tente novamente.')
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
                        {this.props.can('read', 'Tombo') ? (
                            <Menu.Item key="tomboMenuItem">
                                <Link to="/tombos">
                                    <DesktopOutlined />
                                    <span>Tombos</span>
                                </Link>
                            </Menu.Item>
                        ) : null}
                        {TAXONOMIA_RESOURCES.some(resource => this.props.can('read', resource)) ? (
                            <SubMenu
                                key="taxonomiaSubmenu"
                                title={(
                                    <span>
                                        <DesktopOutlined />
                                        <span>Taxonomia</span>
                                    </span>
                                )}
                            >
                                {this.props.can('read', 'Reino') ? (
                                    <Menu.Item key="reinoMenuItem">
                                        <Link to="/reinos">Reinos</Link>
                                    </Menu.Item>
                                ) : null}
                                {this.props.can('read', 'Familia') ? (
                                    <Menu.Item key="familiaMenuItem">
                                        <Link to="/familias">Famílias</Link>
                                    </Menu.Item>
                                ) : null}
                                {this.props.can('read', 'Subfamilia') ? (
                                    <Menu.Item key="subfamiliaMenuItem">
                                        <Link to="/subfamilias">Subfamílias</Link>
                                    </Menu.Item>
                                ) : null}
                                {this.props.can('read', 'Genero') ? (
                                    <Menu.Item key="generoMenuItem">
                                        <Link to="/generos">Gêneros</Link>
                                    </Menu.Item>
                                ) : null}
                                {this.props.can('read', 'Especie') ? (
                                    <Menu.Item key="especieMenuItem">
                                        <Link to="/especies">Espécies</Link>
                                    </Menu.Item>
                                ) : null}
                                {this.props.can('read', 'Subespecie') ? (
                                    <Menu.Item key="subespecieMenuItem">
                                        <Link to="/subespecies">Subespécies</Link>
                                    </Menu.Item>
                                ) : null}
                                {this.props.can('read', 'Variedade') ? (
                                    <Menu.Item key="variedadeMenuItem">
                                        <Link to="/variedades">Variedades</Link>
                                    </Menu.Item>
                                ) : null}
                                {this.props.can('read', 'Autor') ? (
                                    <Menu.Item key="autorMenuItem">
                                        <Link to="/autores">Autores</Link>
                                    </Menu.Item>
                                ) : null}
                            </SubMenu>
                        ) : null}
                        <SubMenu
                            key="locaisSubmenu"
                            title={(
                                <span>
                                    <EnvironmentOutlined />
                                    <span>Locais</span>
                                </span>
                            )}
                        >
                            <Menu.Item key="estadoMenuItem">
                                <Link to="/estados">Estados</Link>
                            </Menu.Item>
                            <Menu.Item key="cidadeMenuItem">
                                <Link to="/cidades">Cidades</Link>
                            </Menu.Item>
                            {this.props.user?.id ? (
                                <Menu.Item key="localColetaMenuItem">
                                    <Link to="/locais-coleta">
                                        <span>Local de Coleta</span>
                                    </Link>
                                </Menu.Item>
                            ) : null}
                        </SubMenu>
                        {this.props.can(['read'], 'Remessa') ? (
                            <Menu.Item key="remessaMenuItem">
                                <Link to="/remessas">
                                    <DatabaseOutlined />
                                    <span>Remessas</span>
                                </Link>
                            </Menu.Item>
                        ) : null}
                        {this.props.can('read', 'Pendencia') ? (
                            <Menu.Item key="pendenciaMenuItem">
                                <Link to="/pendencias">
                                    <BarsOutlined />
                                    <span>Pendências</span>
                                </Link>
                            </Menu.Item>
                        ) : null}
                        {this.props.can('read', 'Usuario') ? (
                            <Menu.Item key="usuarioMenuItem">
                                <Link to="/usuarios">
                                    <TeamOutlined />
                                    <span>Usuários</span>
                                </Link>
                            </Menu.Item>
                        ) : null}
                        {this.props.can('read', 'Identificador') ? (
                            <Menu.Item key="identificadorMenuItem">
                                <Link to="/identificadores">
                                    <TeamOutlined />
                                    <span>Identificadores</span>
                                </Link>
                            </Menu.Item>
                        ) : null}
                        {this.props.can('read', 'Coletor') ? (
                            <Menu.Item key="coletorMenuItem">
                                <Link to="/coletores">
                                    <TeamOutlined />
                                    <span>Coletores</span>
                                </Link>
                            </Menu.Item>
                        ) : null}
                        {this.props.user?.id ? (
                            <Menu.Item key="herbarioMenuItem">
                                <Link to="/herbarios">
                                    <FlagOutlined />
                                    <span>Herbários</span>
                                </Link>
                            </Menu.Item>
                        ) : null}
                        {this.props.user?.id ? (
                            <SubMenu
                                key="fichasSubmenu"
                                title={(
                                    <span>
                                        <FileTextOutlined />
                                        <span>Fichas</span>
                                    </span>
                                )}
                            >
                                <Menu.Item key="fichaTomboMenuItem">
                                    {' '}
                                    <Link to="/fichas/tombos">Ficha tombo</Link>
                                    {' '}
                                </Menu.Item>
                            </SubMenu>
                        ) : null}

                        <SubMenu
                            key="geolocalizacaoSubmenu"
                            title={(
                                <span>
                                    <EnvironmentOutlined />
                                    <span>Geolocalização</span>
                                </span>
                            )}
                        >
                            <Menu.Item key="mapaMenuItem">
                                <Link to="/mapa">Mapa Completo</Link>
                            </Menu.Item>
                            <Menu.Item key="filtroAvancadoMenuItem">
                                <Link to="/filtros">Filtros Avançados</Link>
                            </Menu.Item>
                        </SubMenu>
                        {this.props.user?.id ? (
                            <SubMenu
                                key="relatorios"
                                title={(
                                    <span>
                                        <SnippetsOutlined />
                                        <span>Relatórios</span>
                                    </span>
                                )}
                            >
                                <Menu.Item key="relatorioInventarioEspeciesMenuItem">
                                    <Link to="/relatorio-inventario-especies">Inventário de Espécies</Link>
                                </Menu.Item>
                                <Menu.Item key="relatorioColetaDataMenuItem">
                                    <Link to="/relatorio-coleta-data">Coleta por intervalo de data</Link>
                                </Menu.Item>
                                <Menu.Item key="relatorioColetorDataMenuItem">
                                    <Link to="/relatorio-coletor-data">Coleta por coletor e intervalo de data</Link>
                                </Menu.Item>
                                <Menu.Item key="relatorioFamiliasGeneroMenuItem">
                                    <Link to="/relatorio-familias-genero">Famílias e Gêneros</Link>
                                </Menu.Item>
                                <Menu.Item key="relatorioLocaisColetaMenuItem">
                                    <Link to="/relatorio-locais-coleta">Locais de Coleta</Link>
                                </Menu.Item>
                                <Menu.Item key="relatorioQuantidadeFamiliaGenerosMenuItem">
                                    <Link to="/relatorio-quantidade-familia-generos">
                                        Quantidade por Família e Gênero
                                    </Link>
                                </Menu.Item>
                                <Menu.Item key="relatorioCodigoBarrasMenuItem">
                                    <Link to="/relatorio-codigo-barras">Código de Barras</Link>
                                </Menu.Item>
                            </SubMenu>
                        ) : null}
                        {this.props.canAny(['read', 'create'], 'Exportacao') ? (
                            <Menu.Item key="exportacaoMenuItem">
                                <Link to="/exportacao">
                                    <DesktopOutlined />
                                    <span>Exportação</span>
                                </Link>
                            </Menu.Item>
                        ) : null}
                        {this.props.canAny(['read', 'create'], 'Servico') ? (
                            <SubMenu
                                key="servicos"
                                title={(
                                    <span>
                                        {' '}
                                        <SearchOutlined />
                                        {' '}
                                        <span>Serviços</span>
                                        {' '}
                                    </span>
                                )}
                            >
                                <Menu.Item key="refloraMenuItem">
                                    <Link to="/reflora">Reflora</Link>
                                </Menu.Item>
                                <Menu.Item key="specieslinkMenuItem">
                                    <Link to="/specieslink">speciesLink</Link>
                                </Menu.Item>
                            </SubMenu>
                        ) : null}
                        {this.props.user?.id ? (
                            <Menu.Item key="sairMenuItem">
                                <Link
                                    to="/inicio"
                                    onClick={this.props.logOut}
                                >
                                    <LogoutOutlined />
                                    <span>Sair</span>
                                </Link>
                            </Menu.Item>
                        ) : null}
                    </Menu>
                </Sider>
                <Layout>
                    <Header style={{ background: '#fff' }}>
                        <Row type="flex" justify="space-between">
                            <div style={{ cursor: 'pointer' }}>
                                <MenuUnfoldOutlined onClick={this.toggle} />
                            </div>
                            {this.props.user?.id ? (
                                <div>
                                    {this.props.user?.nome}

                                    <Divider type="vertical" />

                                    <Link to="/perfil">
                                        <Button size="small">Perfil</Button>
                                    </Link>

                                    <Divider type="vertical" />

                                    <Link
                                        to="/inicio"
                                        onClick={this.props.logOut}
                                    >
                                        <Button size="small">Sair</Button>
                                    </Link>
                                </div>
                            ) : (
                                <Link to="/inicio">
                                    <Button>Entrar</Button>
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
