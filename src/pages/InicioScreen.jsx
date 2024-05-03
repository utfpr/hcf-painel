import { Component } from 'react'

import {
    Row, Col, Menu, Spin, notification,
    Layout
} from 'antd'
import { Link } from 'react-router-dom'

import LoginLayout from '../layouts/LoginLayout'

const { Header, Footer, Content } = Layout

export default class InicioScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: false
        }
    }

    renderViewLogin() {
        return (
            <LoginLayout
                redirect={() => this.props.history.push('/')}
                load={valor => {
                    this.setState({
                        loading: valor
                    })
                }}
                requisicao={value => {
                    if (value.codigo === 400 || value.codigo === 422) {
                        this.openNotificationWithIcon('warning', 'Falha', value.mensagem)
                    } else {
                        this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao realizar o login, tente novamente.')
                    }
                }}
            />
        )
    }

    openNotificationWithIcon = (type, message, description) => {
        notification[type]({
            message,
            description
        })
    }

    renderFormulario() {
        return (
            <Layout>
                <Header>
                    <div className="logo" />
                    <Menu
                        theme="dark"
                        mode="horizontal"
                        style={{ lineHeight: '64px' }}
                    >
                        <Menu.Item key="1">SOBRE O HCF</Menu.Item>
                        <Menu.Item key="2">
                            <Link to="/">DASHBOARD</Link>
                        </Menu.Item>
                        <Menu.Item key="3">BUSCAR</Menu.Item>
                        <Menu.Item key="4">CONTATO</Menu.Item>
                    </Menu>
                </Header>
                <Content>
                    <div className="container">
                        <div className="divOpaca">
                            <div className="contentForm">
                                {this.renderViewLogin()}
                            </div>
                        </div>
                    </div>
                </Content>
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

        return this.renderFormulario()
    }
}
