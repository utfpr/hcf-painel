import React, { Component } from 'react';
import { Row, Col, Alert } from 'antd';
import axios from 'axios';
import LoginForm from '../layouts/LoginForm';
import { setTokenUsuario, setUsuario } from '../helpers/usuarios';

export default class LoginLayout extends Component {

    constructor(props) {
        super(props);
        this.state = {
            message: null,
        };
    }

    catchRequestError = ({ message }) => {
        const value = {
            mensagem: '',
            codigo: 500
        }
        this.props.requisicao(value);
        this.setState({ message });
    }

    salvarCrendenciaisUsuario = dados => {
        setTokenUsuario(dados.token);
        localStorage.setItem('token', dados.token);

        setUsuario(dados.usuario);
        const usuario = JSON.stringify(dados.usuario);
        localStorage.setItem('usuario', usuario);
        this.props.redirect();
    }

    requisitaLoginUsuario = valores => {
        const { email, senha } = valores;
        this.props.load(true);
        axios.post('/api/login', { email, senha })
            .then(response => {
                this.props.load(false);
                if (response.status !== 200) {
                    const value = {
                        mensagem: response.data.error.message,
                        codigo: response.status
                    }
                    this.props.requisicao(value);

                }

                this.salvarCrendenciaisUsuario(response.data);

            })
            .catch(err => {
                this.props.load(false);
                const { response } = err;
                if (response && response.data) {
                    const value = {
                        mensagem: response.data.error.message,
                        codigo: response.status
                    }
                    this.props.requisicao(value);
                }
            })
            .catch(this.catchRequestError);
    }

    handleSubmit = (err, valores) => {
        if (!err) {
            this.requisitaLoginUsuario(valores);
        }
    }

    onCloseMessage = () => {
        this.setState({ message: null });
    }

    render() {
        return (
            <Row type="flex" justify="center" align="end">
                <Col span={16} className="style-form">
                    <Row
                        type="flex"
                        justify="center"
                        align="middle"
                        style={{ marginBottom: "10px" }}
                    >
                        <Col span={6}>
                            <img
                                src={require("./../assets/img/logo-hcf-grande.png")}
                                alt="logo-hcf-grande"
                                height="105"
                                width="78"
                            />
                        </Col>
                    </Row>
                    <Row type="flex" justify="center">
                        <Col span={24}>
                            {this.state.message ? (
                                <Alert
                                    type="error"
                                    closable
                                    message={this.state.message}
                                    onClose={this.onCloseMessage} />
                            ) : null}
                        </Col>
                        <Col span={24}>
                            <LoginForm handleSubmit={this.handleSubmit} loading={this.state.loading} />
                        </Col>
                    </Row>
                </Col>
            </Row>
        );
    }
}
