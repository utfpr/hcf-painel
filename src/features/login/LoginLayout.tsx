import React, { useEffect } from 'react'

import {
    Row, Col, Input, Button, Checkbox, Form
} from 'antd'

import {
    MailOutlined, LockOutlined, EyeOutlined, EyeInvisibleOutlined
} from '@ant-design/icons'

import { LoginLayoutProps, LoginRequest } from '../../@types/components'
import logoImage from '../../assets/img/logo_colorida.png'
import ErrorMessage from './components/ErrorMessage'
import { useLoginFormViewModel } from './view-models/useLoginFormViewModel'
import { useLoginLayoutViewModel } from './view-models/useLoginLayoutViewModel'

const LoginLayout: React.FC<LoginLayoutProps> = props => {
    const viewModel = useLoginLayoutViewModel(props)
    const formViewModel = useLoginFormViewModel((err: any, valores: LoginRequest) => viewModel.handleSubmit(err, valores, formViewModel.lembrar))

    useEffect(() => {
        formViewModel.loadSavedCredentials()
    }, [formViewModel])

    const formItemStyle = {
        marginTop: '15px'
    }

    const inputPrefixStyle = {
        color: 'rgba(0, 0, 0, 0.25)'
    }

    const eyeButtonStyle = {
        border: 'none',
        boxShadow: 'none',
        color: 'rgba(0, 0, 0, 0.25)'
    }

    return (
        <Row justify="center" align="middle">
            <Col span={16} className="style-form">
                <Row
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
                <ErrorMessage
                    message={viewModel.message}
                    onClose={viewModel.onCloseMessage}
                />
                <Row justify="center">
                    <Col span={24}>
                        <Form
                            onFinish={formViewModel.handleSubmit}
                            layout="vertical"
                        >
                            <Form.Item style={formItemStyle}>
                                <Input
                                    prefix={<MailOutlined style={inputPrefixStyle} />}
                                    placeholder="E-mail"
                                    size="large"
                                    value={formViewModel.email}
                                    onChange={e => formViewModel.setEmail(e.target.value)}
                                />
                            </Form.Item>
                            <Form.Item style={formItemStyle}>
                                <Input
                                    size="large"
                                    type={formViewModel.senhaVisivel ? 'text' : 'password'}
                                    placeholder="Senha"
                                    prefix={<LockOutlined style={inputPrefixStyle} />}
                                    suffix={(
                                        <Button
                                            type="text"
                                            icon={formViewModel.senhaVisivel ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                                            onClick={formViewModel.toggleSenhaVisivel}
                                            style={eyeButtonStyle}
                                        />
                                    )}
                                    value={formViewModel.senha}
                                    onChange={e => formViewModel.setSenha(e.target.value)}
                                />
                            </Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                className="login-form-button"
                                size="large"
                            >
                                Entrar
                            </Button>
                            <br />
                            <br />
                            <Form.Item>
                                <Checkbox
                                    checked={formViewModel.lembrar}
                                    onChange={e => formViewModel.setLembrar(e.target.checked)}
                                >
                                    Lembrar me
                                </Checkbox>
                                <a href="/recuperar-senha" className="login-form-forgot">Esqueci a senha</a>
                                <br />
                                <br />
                            </Form.Item>
                        </Form>
                    </Col>
                </Row>
            </Col>
        </Row>
    )
}

export default LoginLayout
