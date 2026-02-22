import React, { Component } from 'react'
import { Button, Card, Col, Divider, Form, Input, Modal, Row, Spin, notification } from 'antd'
import axios from 'axios'

import { broker } from '@/libraries/events/Broker'

export default class PerfilScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: true,
            user: null,
            modalVisible: false,
            confirmLoading: false,
            updateProfileModalVisible: false
        }
    }

    componentDidMount() {
        const userInfo = localStorage.getItem('usuario');
        if (userInfo) {
            const user = JSON.parse(userInfo);

            axios.get(`/usuarios/${user.id}`)
                .then(response => {
                    if (response.status === 200) {
                        this.setState({
                            user: response.data,
                            loading: false
                        });
                    } else {
                        notification.error({
                            message: 'Erro',
                            description: 'Não foi possível carregar as informações do usuário.'
                        });
                        this.setState({ loading: false });
                    }
                })
                .catch(() => {
                    notification.error({
                        message: 'Erro',
                        description: 'Houve um problema ao buscar os dados do usuário. Tente novamente.'
                    });
                    this.setState({ loading: false });
                });
        }
    }

    handleOpenModal = () => {
        this.setState({ modalVisible: true })
    }

    handleCloseModal = () => {
        this.setState({ modalVisible: false })
    }

    handleOpenUpdateProfileModal = () => {
        this.setState({ updateProfileModalVisible: true });
    }

    handleCloseUpdateProfileModal = () => {
        this.setState({ updateProfileModalVisible: false });
    }

    handleUpdatePassword = values => {
        const { user } = this.state
        this.setState({ confirmLoading: true })

        axios.put(`/usuarios/${user.id}/senha`, {
            senhaAtual: values.senhaAtual,
            novaSenha: values.novaSenha
        })
            .then(() => {
                notification.success({
                    message: 'Sucesso',
                    description: 'Senha atualizada com sucesso.'
                })
                this.setState({ modalVisible: false })
            })
            .catch(() => {
                notification.error({
                    message: 'Erro',
                    description: 'Não foi possível atualizar a senha. Verifique os dados e tente novamente.'
                })
            })
            .finally(() => {
                this.setState({ confirmLoading: false })
            })
    }

    handleUpdateProfile = values => {
        const { user } = this.state
        this.setState({ confirmLoading: true })

        axios.put(`/usuarios/${user.id}`, {
            email: user.email,
            nome: values.nome,
            tipo_usuario_id: user.tipos_usuario.id,
            herbario_id: user.herbario_id,
            usuario_id: user.id,
            telefone: values.telefone
        })
            .then(() => {
                notification.success({
                    message: 'Sucesso',
                    description: 'Perfil atualizado com sucesso.'
                })

                const updatedUser = { ...user, nome: values.nome, telefone: values.telefone }
                localStorage.setItem('usuario', JSON.stringify(updatedUser))

                broker.emit('userNameUpdated', undefined)

                this.setState({
                    user: updatedUser,
                    updateProfileModalVisible: false
                })
            })
            .catch(() => {
                notification.error({
                    message: 'Erro',
                    description: 'Não foi possível atualizar o perfil. Tente novamente.'
                })
            })
            .finally(() => {
                this.setState({ confirmLoading: false })
            })
    }

    render() {
        const { user, loading, modalVisible, confirmLoading, updateProfileModalVisible } = this.state;

        if (loading) {
            return <Spin tip="Carregando..." />;
        }

        return (
            <Card title="Perfil do Usuário" style={{ maxWidth: 600, margin: '0 auto' }}>
                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        <div>
                            <strong>Nome:</strong>
                        </div>
                        <div>{user.nome}</div>
                    </Col>
                    <Col span={24}>
                        <div>
                            <strong>E-mail:</strong>
                        </div>
                        <div>{user.email}</div>
                    </Col>
                    <Col span={24}>
                        <div>
                            <strong>Telefone:</strong>
                        </div>
                        <div>{user.telefone || 'Não informado'}</div>
                    </Col>
                    <Col span={24}>
                        <div>
                            <strong>RA:</strong>
                        </div>
                        <div>{user.ra || 'Não informado'}</div>
                    </Col>
                    <Col span={24}>
                        <div>
                            <strong>Tipo de Usuário:</strong>
                        </div>
                        <div>{user.tipos_usuario.tipo}</div>
                    </Col>
                </Row>
                <Divider />
                <Row gutter={[16, 16]} justify="center">
                    <Col>
                        <Button type="primary" onClick={this.handleOpenUpdateProfileModal}>Atualizar Perfil</Button>
                    </Col>
                    <Col>
                        <Button type="default" onClick={this.handleOpenModal}>Atualizar Senha</Button>
                    </Col>
                </Row>

                <Modal
                    title="Atualizar Perfil"
                    visible={updateProfileModalVisible}
                    onCancel={this.handleCloseUpdateProfileModal}
                    footer={null}
                >
                    <Form
                        initialValues={{
                            nome: user.nome,
                            telefone: user.telefone
                        }}
                        onFinish={this.handleUpdateProfile}
                    >
                        <Form.Item
                            label="Nome"
                            name="nome"
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            rules={[{ message: 'Insira o nome.' }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label="Telefone"
                            name="telefone"
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            rules={[{ message: 'Insira o telefone.' }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={confirmLoading} block>
                                Atualizar Perfil
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>

                <Modal
                    title="Atualizar Senha"
                    visible={modalVisible}
                    onCancel={this.handleCloseModal}
                    footer={null}
                >
                    <Form onFinish={this.handleUpdatePassword}>
                        <Form.Item
                            label="Senha Atual"
                            name="senhaAtual"
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            rules={[{ message: 'Insira sua senha atual.' }]}
                        >
                            <Input.Password />
                        </Form.Item>
                        <Form.Item
                            label="Nova Senha"
                            name="novaSenha"
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            rules={[
                                { message: 'Insira a nova senha.' },
                                { min: 6, message: 'A senha deve ter no mínimo 6 caracteres.' }
                            ]}
                        >
                            <Input.Password />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={confirmLoading} block>
                                Atualizar Senha
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>
            </Card>
        );
    }
}
