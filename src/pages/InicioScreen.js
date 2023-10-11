import React, { Component } from 'react';
import { Row, Col, Menu, Spin, notification } from 'antd';
import { Link } from 'react-router-dom';
import { Layout } from 'antd';

import LoginLayout from '../layouts/LoginLayout';

const { Header, Footer, Content } = Layout;


export default class InicioScreen extends Component {

    state = {
        loading: false,
    };

    renderViewLogin() {
        return (
            <LoginLayout
                redirect={() => this.props.history.push('/')}
                load={valor => {
                    this.setState({
                        loading: valor,
                    });
                }}
                requisicao={(value) => {
                    if (value.codigo === 400 || value.codigo === 422) {
                        this.openNotificationWithIcon('warning', 'Falha', value.mensagem);
                    } else {
                        this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao realizar o login, tente novamente.');
                    }
                }}
            />
        );
    }

    openNotificationWithIcon = (type, message, description) => {
        notification[type]({
            message: message,
            description: description,
        });
    };

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
                    <Row className="container-main">
                        <div className="view-cloud">
                            <div className="x1">
                                <div className="cloud" />
                            </div>

                            <div className="x2">
                                <div className="cloud" />
                            </div>

                            <div className="x3">
                                <div className="cloud" />
                            </div>
                        </div>

                        <Col xs={0} sm={4} md={10} lg={14} xl={14} className="container-hcf" />
                        <Col xs={24} sm={20} md={14} lg={10} xl={10} className="container-login">
                            {this.renderViewLogin()}
                        </Col>
                    </Row>
                </Content>
                <Footer className="forest-footer" />
            </Layout>
        );
    }

    render() {
        if (this.state.loading) {
            return (
                <Spin tip="Carregando...">
                    {this.renderFormulario()}
                </Spin>
            )
        }

        return this.renderFormulario();
    }
}
