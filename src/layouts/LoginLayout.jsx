import { Component } from 'react'

import { Row, Col, Alert } from 'antd'
import axios from 'axios'

import logoImage from '../assets/img/logo_colorida.png'
import { setTokenUsuario, setUsuario } from '../helpers/usuarios'
import rateLimiter from '../helpers/rateLimiter'
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
        
        // Verifica rate limit para login
        const rateLimitCheck = rateLimiter.checkLimit('login', email);
        if (!rateLimitCheck.allowed) {
            const resetTime = rateLimiter.formatResetTime(rateLimitCheck.resetTime);
            const value = {
                mensagem: `Muitas tentativas de login. Tente novamente em ${resetTime}.`,
                codigo: 429
            };
            this.props.requisicao(value);
            return;
        }
        
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

                // Login bem-sucedido - limpa tentativas de rate limit
                rateLimiter.clearAttempts('login', email);
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
                
                // Registra tentativa falhada no rate limit
                rateLimiter.recordAttempt('login', email);
                
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
                        style={{ marginBottom: '10px', textAlign: 'center' }}
                    >
                        <Col span={24} style={{ display: 'flex', justifyContent: 'center' }}>
                            <img
                                src={logoImage}
                                alt="leaves"
                                height="160px"
                                width="160px"
                                style={{ display: 'block' }}
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
