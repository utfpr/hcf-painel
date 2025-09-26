import { Component } from 'react'

import { Row, Col, Alert } from 'antd'
import axios from 'axios'

import logoImage from '../assets/img/leaves.png'
import { setTokenUsuario, setUsuario } from '../helpers/usuarios'
import LoginForm from './LoginForm'
import { AnalyticsContext } from '@/components/Analytics/AnalyticsContext'

export default class LoginLayout extends Component {
    static contextType = AnalyticsContext;

    constructor(props) {
        super(props)
        this.state = {
            message: null
        }
    }

    catchRequestError = ({ message }) => {
        const value = {
            mensagem: '',
            codigo: 500
        }
        this.props.requisicao(value)
        this.setState({ message })
    }

    salvarCrendenciaisUsuario = dados => {
        setTokenUsuario(dados.token)
        localStorage.setItem('token', dados.token)

        setUsuario(dados.usuario)
        const usuario = JSON.stringify(dados.usuario)
        localStorage.setItem('usuario', usuario)
        this.props.redirect()
    }

    requisitaLoginUsuario = valores => {
        const { email, senha } = valores
        this.props.load(true)
        axios.post('/login', { email, senha })
            .then(response => {
                this.props.load(false)
                if (response.status !== 200) {
                    const value = {
                        mensagem: response.data.error.message,
                        codigo: response.status
                    }
                    this.props.requisicao(value)
                }

                this.salvarCrendenciaisUsuario(response.data)

                const usuario = response.data.usuario;
                this.context?.analytics?.identify({
                    id: usuario.id,
                    name: usuario.nome,
                    email: usuario.email
                })
            })
            .catch(err => {
                this.props.load(false)
                const { response } = err
                if (response && response.data) {
                    const value = {
                        mensagem: response.data.error.message,
                        codigo: response.status
                    }
                    this.props.requisicao(value)
                }
            })
            .catch(this.catchRequestError)
    }

    handleSubmit = (err, valores) => {
        if (!err) {
            this.requisitaLoginUsuario(valores)
        }
    }

    onCloseMessage = () => {
        this.setState({ message: null })
    }

    render() {
        return (
            <Row type="flex" justify="center" align="middle">
                <Col span={16} className="style-form">
                    <Row
                        type="flex"
                        justify="center"
                        align="middle"
                        style={{ marginBottom: '10px' }}
                    >
                        <Col span={6}>
                            <img
                                src={logoImage}
                                alt="leaves"
                                height="105"
                                width="105"
                            />
                        </Col>
                    </Row>
                    <Row
                        type="flex"
                        justify="center"
                        align="middle"
                        style={{ marginBottom: '10px' }}
                    >
                        <span style={{ textAlign: 'center', width: '100%' }}>HCF - Herbário do Centro Federal</span>
                    </Row>
                    <Row type="flex" justify="center">
                        <Col span={24}>
                            {this.state.message ? (
                                <Alert
                                    type="error"
                                    closable
                                    message={this.state.message}
                                    onClose={this.onCloseMessage}
                                />
                            ) : null}
                        </Col>
                        <Col span={24}>
                            <LoginForm handleSubmit={this.handleSubmit} loading={this.state.loading} />
                        </Col>
                    </Row>
                </Col>
            </Row>
        )
    }
}
