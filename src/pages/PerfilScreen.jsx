import React, { Component } from 'react'

import { Button, Card, Col, Divider, Form, Input, Modal, Row, Spin, notification } from 'antd'
import axios from 'axios'
import { withTranslation } from 'react-i18next'

import { broker } from '@/libraries/events/Broker'

class PerfilScreen extends Component {
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
        const userInfo = localStorage.getItem('usuario')
        if (userInfo) {
            const user = JSON.parse(userInfo)

            axios.get(`/usuarios/${user.id}`)
                .then(response => {
                    if (response.status === 200) {
                        this.setState({
                            user: response.data,
                            loading: false
                        })
                    } else {
                        notification.error({
                            message: this.props.t('common:erro'),
                            description: this.props.t('perfilScreen:erroCarregarUsuario')
                        })
                        this.setState({ loading: false })
                    }
                })
                .catch(() => {
                    notification.error({
                        message: this.props.t('common:erro'),
                        description: this.props.t('perfilScreen:erroBuscarUsuario')
                    })
                    this.setState({ loading: false })
                })
        }
    }

    handleOpenModal = () => {
        this.setState({ modalVisible: true })
    }

    handleCloseModal = () => {
        this.setState({ modalVisible: false })
    }

    handleOpenUpdateProfileModal = () => {
        this.setState({ updateProfileModalVisible: true })
    }

    handleCloseUpdateProfileModal = () => {
        this.setState({ updateProfileModalVisible: false })
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
                    message: this.props.t('common:tituloSucesso'),
                    description: this.props.t('perfilScreen:senhaAtualizadaSucesso')
                })
                this.setState({ modalVisible: false })
            })
            .catch(() => {
                notification.error({
                    message: this.props.t('common:erro'),
                    description: this.props.t('perfilScreen:erroAtualizarSenha')
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
                    message: this.props.t('common:tituloSucesso'),
                    description: this.props.t('perfilScreen:perfilAtualizadoSucesso')
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
                    message: this.props.t('common:erro'),
                    description: this.props.t('perfilScreen:erroAtualizarPerfil')
                })
            })
            .finally(() => {
                this.setState({ confirmLoading: false })
            })
    }

    render() {
        const { t } = this.props
        const { user, loading, modalVisible, confirmLoading, updateProfileModalVisible } = this.state

        if (loading) {
            return <Spin tip={t('common:carregando')} />
        }

        return (
            <Card title={t('perfilScreen:tituloPerfil')} style={{ maxWidth: 600, margin: '0 auto' }}>
                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        <div>
                            <strong>{t('perfilScreen:dadosNome')}</strong>
                        </div>
                        <div>{user.nome}</div>
                    </Col>
                    <Col span={24}>
                        <div>
                            <strong>{t('perfilScreen:dadosEmail')}</strong>
                        </div>
                        <div>{user.email}</div>
                    </Col>
                    <Col span={24}>
                        <div>
                            <strong>{t('perfilScreen:dadosTelefone')}</strong>
                        </div>
                        <div>{user.telefone || t('perfilScreen:naoInformado')}</div>
                    </Col>
                    <Col span={24}>
                        <div>
                            <strong>{t('perfilScreen:dadosRa')}</strong>
                        </div>
                        <div>{user.ra || t('perfilScreen:naoInformado')}</div>
                    </Col>
                    <Col span={24}>
                        <div>
                            <strong>{t('perfilScreen:dadosTipoUsuario')}</strong>
                        </div>
                        <div>{user.tipos_usuario.tipo}</div>
                    </Col>
                </Row>
                <Divider />
                <Row gutter={[16, 16]} justify="center">
                    <Col>
                        <Button type="primary" onClick={this.handleOpenUpdateProfileModal}>{t('perfilScreen:atualizarPerfil')}</Button>
                    </Col>
                    <Col>
                        <Button type="default" onClick={this.handleOpenModal}>{t('perfilScreen:atualizarSenha')}</Button>
                    </Col>
                </Row>

                <Modal
                    title={t('perfilScreen:atualizarPerfil')}
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
                            label={t('perfilScreen:formNome')}
                            name="nome"
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            rules={[{ message: t('perfilScreen:insiraNome') }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label={t('perfilScreen:formTelefone')}
                            name="telefone"
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            rules={[{ message: t('perfilScreen:insiraTelefone') }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={confirmLoading} block>
                                {t('perfilScreen:atualizarPerfil')}
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>

                <Modal
                    title={t('perfilScreen:atualizarSenha')}
                    visible={modalVisible}
                    onCancel={this.handleCloseModal}
                    footer={null}
                >
                    <Form onFinish={this.handleUpdatePassword}>
                        <Form.Item
                            label={t('perfilScreen:senhaAtual')}
                            name="senhaAtual"
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            rules={[{ message: t('perfilScreen:insiraSenhaAtual') }]}
                        >
                            <Input.Password />
                        </Form.Item>
                        <Form.Item
                            label={t('perfilScreen:novaSenha')}
                            name="novaSenha"
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            rules={[
                                { message: t('perfilScreen:insiraNovaSenha') },
                                { min: 6, message: t('perfilScreen:senhaMinima') }
                            ]}
                        >
                            <Input.Password />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={confirmLoading} block>
                                {t('perfilScreen:atualizarSenha')}
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>
            </Card>
        )
    }
}

export default withTranslation()(PerfilScreen)
