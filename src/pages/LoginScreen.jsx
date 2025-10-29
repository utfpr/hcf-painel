import { Component } from 'react'

import {
    Row, Col, Menu, Spin, notification,
    Layout
} from 'antd'
import { Link } from 'react-router-dom'

import LoginLayout from '../layouts/LoginLayout'
import InicioLayout from './InicioScreen'

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
                redirect={() => this.props.history.push('/tombos')}
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
            <InicioLayout>
                {this.renderViewLogin()}
            </InicioLayout>
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
