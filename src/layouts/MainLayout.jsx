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

import logoImage from '../assets/img/logo-hcf-branco.png'
import { baseUrl } from '../config/api'
import {
    isCurador,
    isCuradorOuOperador,
    isLogado,
    isCuradorOuOperadorOuIdentificador,
    setTokenUsuario, setUsuario, getTokenUsuario
} from '../helpers/usuarios'

const { Header, Content, Sider } = Layout
const { SubMenu } = Menu

export default class MainLayout extends Component {
    constructor(props) {
        super(props)
        this.state = {
            collapsed: false,
            loading: false,
            userName: ''
        }
    }

    componentDidMount() {
        this.updateUserNameFromLocalStorage()

        window.addEventListener('userNameUpdated', this.updateUserNameFromLocalStorage)
    }

    componentDidUpdate(prevProps, prevState) {
        const userInfo = localStorage.getItem('usuario')
        if (userInfo) {
            const user = JSON.parse(userInfo)
            if (user.nome !== prevState.userName) {
                this.setState({ userName: user.nome })
            }
        }
    }

    componentWillUnmount() {
        window.removeEventListener('userNameUpdated', this.updateUserNameFromLocalStorage)
    }

    updateUserNameFromLocalStorage = () => {
        const userInfo = localStorage.getItem('usuario')
        if (userInfo) {
            const user = JSON.parse(userInfo)
            this.setState({ userName: user.nome })
        }
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

    fazLogout = () => {
        setTokenUsuario('')
        localStorage.setItem('token', '')

        setUsuario('')
        localStorage.setItem('usuario', '')
    }

    renderFormulario() {
        return (
            <Layout style={{ minHeight: '100vh' }}>
                <Sider trigger={null} collapsible collapsed={this.state.collapsed}>
                    <Col align="center" style={{ marginTop: 20, marginBottom: 20 }}>
                        <Link to="/">
                            <img
                                src={logoImage}
                                alt="logo-hcf"
                                height="87"
                                width="61"
                            />
                        </Link>
                    </Col>
                    <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
                        <Menu.Item key="1">
                            <Link to="/tombos">
                                <DesktopOutlined />
                                <span>Tombos</span>
                            </Link>
                        </Menu.Item>
                        <SubMenu
                            key="subTaxo"
                            title={(
                                <span>
                                    <DesktopOutlined />
                                    <span>Taxonomia</span>
                                </span>
                            )}
                        >
                            <Menu.Item key="80">
                                <Link to="/reinos">Reinos</Link>
                            </Menu.Item>
                            <Menu.Item key="2">
                                <Link to="/familias">Famílias</Link>
                            </Menu.Item>
                            <Menu.Item key="3">
                                <Link to="/subfamilias">Subfamílias</Link>
                            </Menu.Item>
                            <Menu.Item key="4">
                                <Link to="/generos">Gêneros</Link>
                            </Menu.Item>
                            <Menu.Item key="5">
                                <Link to="/especies">Espécies</Link>
                            </Menu.Item>
                            <Menu.Item key="6">
                                <Link to="/subespecies">Subespécies</Link>
                            </Menu.Item>
                            <Menu.Item key="7">
                                <Link to="/variedades">Variedades</Link>
                            </Menu.Item>
                            <Menu.Item key="8">
                                <Link to="/autores">Autores</Link>
                            </Menu.Item>
                        </SubMenu>
                        {isCuradorOuOperador() ? (
                            <Menu.Item key="9">
                                <Link to="/remessas">
                                    <DatabaseOutlined />
                                    <span>Remessas</span>
                                </Link>
                            </Menu.Item>
                        ) : null}
                        {isCurador() ? (
                            <Menu.Item key="10">
                                <Link to="/pendencias">
                                    <BarsOutlined />
                                    <span>Pendências</span>
                                </Link>
                            </Menu.Item>
                        ) : null}
                        {isCurador() ? (
                            <Menu.Item key="11">
                                <Link to="/usuarios">
                                    <TeamOutlined />
                                    <span>Usuários</span>
                                </Link>
                            </Menu.Item>
                        ) : null}
                        {isCurador() ? (
                            <Menu.Item key="12">
                                <Link to="/identificadores">
                                    <TeamOutlined />
                                    <span>Identificadores</span>
                                </Link>
                            </Menu.Item>
                        ) : null}
                        {isCurador() ? (
                            <Menu.Item key="13">
                                <Link to="/coletores">
                                    <TeamOutlined />
                                    <span>Coletores</span>
                                </Link>
                            </Menu.Item>
                        ) : null}
                        {isLogado() ? (
                            <Menu.Item key="14">
                                <Link to="/herbarios">
                                    <FlagOutlined />
                                    <span>Herbários</span>
                                </Link>
                            </Menu.Item>
                        ) : null}
                        {isLogado() ? (
                            <SubMenu
                                key="sub2"
                                title={(
                                    <span>
                                        <FileTextOutlined />
                                        <span>Fichas</span>
                                    </span>
                                )}
                            >
                                <Menu.Item key="15">
                                    {' '}
                                    <Link to="/fichas/tombos">Ficha tombo</Link>
                                    {' '}
                                </Menu.Item>
                            </SubMenu>
                        ) : null}

                        <SubMenu
                            key="sub3"
                            title={(
                                <span>
                                    <EnvironmentOutlined />
                                    <span>Geolocalização</span>
                                </span>
                            )}
                        >
                            <Menu.Item key="18">
                                <Link to="/mapa">Mapa Completo</Link>
                            </Menu.Item>
                            <Menu.Item key="19">
                                <Link to="/filtros">Filtros Avançados</Link>
                            </Menu.Item>
                        </SubMenu>
                        {isLogado() ? (
                            <SubMenu
                                key="relatorios"
                                title={(
                                    <span>
                                        <SnippetsOutlined />
                                        <span>Relatórios</span>
                                    </span>
                                )}
                            >
                                <Menu.Item key="relatorio-inventario-especies">
                                    <Link to="/relatorio-inventario-especies">Inventário de Espécies</Link>
                                </Menu.Item>
                                <Menu.Item key="relatorio-coleta-local-data">
                                    <Link to="/relatorio-coleta-local-data">Coleta por local e intervalo de data</Link>
                                </Menu.Item>
                                <Menu.Item key="relatorio-coleta-data">
                                    <Link to="/relatorio-coleta-data">Coleta por intervalo de data</Link>
                                </Menu.Item>
                                <Menu.Item key="relatorio-coletor-data">
                                    <Link to="/relatorio-coletor-data">Coleta por coletor e intervalo de data</Link>
                                </Menu.Item>
                                <Menu.Item key="relatorio-familias-genero">
                                    <Link to="/relatorio-familias-genero">Famílias e Gêneros</Link>
                                </Menu.Item>
                                <Menu.Item key="relatorio-locais-coleta">
                                    <Link to="/relatorio-locais-coleta">Locais de Coleta</Link>
                                </Menu.Item>
                                <Menu.Item key="relatorio-quantidade-familia-generos">
                                    <Link to="/relatorio-quantidade-familia-generos">Quantidade por Família e Gênero</Link>
                                </Menu.Item>
                                <Menu.Item key="relatorio-codigo-barras">
                                    <Link to="/relatorio-codigo-barras">Código de Barras</Link>
                                </Menu.Item>
                            </SubMenu>
                        ) : null}
                        {isCuradorOuOperador() ? (
                            <Menu.Item key="16">
                                <Link to="/exportacao">
                                    <DesktopOutlined />
                                    <span>Exportação</span>
                                </Link>
                            </Menu.Item>
                        ) : null}
                        {isCurador() ? (
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
                                <Menu.Item key="18">
                                    <Link to="/reflora">Reflora</Link>
                                </Menu.Item>
                                <Menu.Item key="19">
                                    <Link to="/specieslink">speciesLink</Link>
                                </Menu.Item>
                            </SubMenu>
                        ) : null}
                        {isLogado() ? (
                            <Menu.Item key="20">
                                <Link
                                    to="/inicio"
                                    onClick={this.fazLogout}
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
                            {!isCuradorOuOperadorOuIdentificador() ? (
                                <Link to="/inicio">
                                    <Button>Entrar</Button>
                                </Link>
                            ) : (
                                <div>
                                    {this.state.userName}

                                    <Divider type="vertical" />

                                    <Link to="/perfil">
                                        <Button size="small">Perfil</Button>
                                    </Link>

                                    <Divider type="vertical" />

                                    <Link
                                        to="/inicio"
                                        onClick={this.fazLogout}
                                    >
                                        <Button size="small">Sair</Button>
                                    </Link>
                                </div>
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
