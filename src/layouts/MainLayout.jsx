import { Component } from 'react'

import {
    Layout, Menu, Icon, Col, Spin, Button, Row
} from 'antd'
import axios from 'axios'
import { Link } from 'react-router-dom'

import logoImage from '../assets/img/logo-hcf-branco.png'
import { baseUrl } from '../config/api'
import {
    isCurador,
    isCuradorOuOperador,
    isLogado,
    isCuradorOuOperadorOuIdentificador,
    setTokenUsuario, setUsuario
} from '../helpers/usuarios'

const { Header, Content, Sider } = Layout
const { SubMenu } = Menu

export default class MainLayout extends Component {
    constructor(props) {
        super(props)
        this.state = {
            collapsed: false,
            loading: false
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
        axios.get('/api/darwincore')
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
                                <Icon type="desktop" />
                                <span>Tombos</span>
                            </Link>
                        </Menu.Item>
                        <SubMenu
                            key="subTaxo"
                            title={(
                                <span>
                                    <Icon type="desktop" />
                                    <span>Taxonomias</span>
                                </span>
                            )}
                        >
                            <Menu.Item key="20">
                                <Link to="/familias">Familias</Link>
                            </Menu.Item>
                            <Menu.Item key="21">
                                <Link to="/subfamilias">Subfamilias</Link>
                            </Menu.Item>
                            <Menu.Item key="22">
                                <Link to="/generos">Gêneros</Link>
                            </Menu.Item>
                            <Menu.Item key="23">
                                <Link to="/especies">Espécies</Link>
                            </Menu.Item>
                            <Menu.Item key="24">
                                <Link to="/subespecies">Subespecies</Link>
                            </Menu.Item>
                            <Menu.Item key="25">
                                <Link to="/variedades">Variedades</Link>
                            </Menu.Item>
                            <Menu.Item key="26">
                                <Link to="/autores">Autores</Link>
                            </Menu.Item>
                        </SubMenu>
                        {isCuradorOuOperador() ? (
                            <Menu.Item key="8">
                                <Link to="/remessas">
                                    <Icon type="database" />
                                    <span>Remessas</span>
                                </Link>
                            </Menu.Item>
                        ) : null}
                        {isCurador() ? (
                            <Menu.Item key="7">
                                <Link to="/pendencias">
                                    <Icon type="bars" />
                                    <span>Pendências</span>
                                </Link>
                            </Menu.Item>
                        ) : null}
                        {isCurador() ? (
                            <Menu.Item key="9">
                                <Link to="/usuarios">
                                    <Icon type="team" />
                                    <span>Usuários</span>
                                </Link>
                            </Menu.Item>
                        ) : null}
                        <Menu.Item key="10">
                            <Link to="/herbarios">
                                <Icon type="flag" />
                                <span>Herbários</span>
                            </Link>
                        </Menu.Item>
                        <SubMenu
                            key="sub2"
                            title={(
                                <span>
                                    <Icon type="file-text" />
                                    <span>Fichas</span>
                                </span>
                            )}
                        >
                            <Menu.Item key="15">
                                {' '}
                                <Link to="/fichas/tombos">Ficha Tombo</Link>
                                {' '}
                            </Menu.Item>
                        </SubMenu>
                        {isCuradorOuOperador() ? (
                            <Menu.Item key="16">
                                <a href={`${baseUrl}/api/darwincore`} target="_blank" rel="noreferrer">
                                    <Icon type="desktop" />
                                    <span>Darwin Core</span>
                                </a>
                            </Menu.Item>
                        ) : null}
                        {isCurador() ? (
                            <SubMenu
                                key="servicos"
                                title={(
                                    <span>
                                        {' '}
                                        <Icon type="search" />
                                        {' '}
                                        <span>Serviços</span>
                                        {' '}
                                    </span>
                                )}
                            >
                                <Menu.Item key="20">
                                    <Link to="/reflora">Reflora</Link>
                                </Menu.Item>
                                <Menu.Item key="21">
                                    <Link to="/specieslink">speciesLink</Link>
                                </Menu.Item>
                            </SubMenu>
                        ) : null}
                        {isLogado() ? (

                            <Menu.Item key="17">
                                <Link
                                    to="/inicio"
                                    onClick={() => {
                                        setTokenUsuario('')
                                        localStorage.setItem('token', '')

                                        setUsuario('')
                                        localStorage.setItem('usuario', '')
                                        console.log('ZERO TOKEN')
                                    }}
                                >
                                    <Icon type="logout" />
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
                                <Icon
                                    className="trigger"
                                    type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
                                    onClick={this.toggle}
                                />
                            </div>
                            {!isCuradorOuOperadorOuIdentificador() ? (
                                <Link to="/inicio">
                                    <Button>Entrar</Button>
                                </Link>
                            ) : null}
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
