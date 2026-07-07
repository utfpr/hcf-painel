import { Component } from 'react'

import {

    Row,
    Col,
    Divider,
    Input,
    Button,
    Select,
    notification,
    Spin
} from 'antd'
import axios from 'axios'
import { withTranslation } from 'react-i18next'

import { Form } from '@ant-design/compatible'

const FormItem = Form.Item
const { Option } = Select

class NovoUsuarioScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: false,
            tipoUsuarioInicial: ''
        }
    }

    componentDidMount() {
        if (this.props.match.params.usuario_id !== undefined) {
            this.requisitaUsuario()
            this.setState({
                loading: true
            })
        }
    }

    openNotificationWithIcon = (type, message, description) => {
        notification[type]({
            message,
            description
        })
    }

    handleSubmit = (err, valores) => {
        if (!err) {
            if (this.props.match.params.usuario_id !== undefined) {
                this.requisitaEdicaoUsuario(valores)
            } else if (valores.password == null || valores.password.trim() == '') {
                this.openNotificationWithIcon('error', this.props.t('common:tituloFalha'), this.props.t('novoUsuarioScreen:validacaoSenha'))
            } else {
                this.requisitaCadastroUsuario(valores)
            }
        }
    }

    onSubmit = event => {
        event.preventDefault()
        this.props.form.validateFields(this.handleSubmit)
    }

    requisitaCadastroUsuario = valores => {
        this.setState({
            loading: true
        })
        const {
            nome,
            email,
            password,
            ra,
            telefone,
            tipo
        } = valores

        axios.post('/usuarios', {
            ra,
            nome,
            email,
            tipo_usuario_id: tipo,
            telefone,
            senha: password,
            herbario_id: 1
        })
            .then(response => {
                if (response.status !== 201) {
                    this.openNotificationWithIcon('error', this.props.t('novoUsuarioScreen:tituloCadastro'), this.props.t('novoUsuarioScreen:erroCadastro'))
                } else {
                    this.props.form.resetFields()
                    this.openNotificationWithIcon('success', this.props.t('novoUsuarioScreen:tituloCadastro'), this.props.t('novoUsuarioScreen:sucessoCadastro'))
                    this.props.history.goBack()
                }
                this.setState({
                    loading: false
                })
            })
            .catch(err => {
                this.setState({
                    loading: false
                })
                this.openNotificationWithIcon('error', this.props.t('novoUsuarioScreen:tituloCadastro'), this.props.t('novoUsuarioScreen:erroCadastroEmailUnico'))

                const { response } = err
                if (response && response.data) {
                    const { error } = response.data
                    console.error(error.message)
                }
            })
            .catch(this.catchRequestError)
    }

    requisitaUsuario = () => {
        axios.get(`/usuarios/${this.props.match.params.usuario_id}`)
            .then(response => {
                if (response.data && response.status === 200) {
                    this.props.form.setFields({
                        nome: {
                            value: response.data.nome
                        },
                        email: {
                            value: response.data.email
                        },
                        password: {
                            value: ''
                        },
                        ra: {
                            value: response.data.ra === null ? '' : response.data.ra
                        },
                        telefone: {
                            value: response.data.telefone === null ? '' : response.data.telefone
                        }
                    })
                    this.setState({
                        loading: false,
                        tipoUsuarioInicial: response.data.tipos_usuario.id
                    })
                } else {
                    this.openNotificationWithIcon('error', this.props.t('common:tituloFalha'), this.props.t('novoUsuarioScreen:erroBuscarUsuario'))
                }
            })
            .catch(err => {
                this.setState({
                    loading: false
                })
                const { response } = err
                if (response && response.data) {
                    const { error } = response.data
                    console.error(error.message)
                }
            })
            .catch(this.catchRequestError)
    }

    requisitaEdicaoUsuario = valores => {
        this.setState({
            loading: true
        })

        const {
            nome,
            email,
            password,
            ra,
            telefone,
            tipo
        } = valores
        const body = {
            ra,
            nome,
            email,
            tipo_usuario_id: tipo,
            telefone,
            herbario_id: 1
        }
        if (valores.password != null && valores.password.trim() != '') {
            body.senha = password
        }
        axios.put(`/usuarios/${this.props.match.params.usuario_id}`, body)
            .then(response => {
                if (response.status !== 201 && response.status !== 204) {
                    this.openNotificationWithIcon('error', this.props.t('novoUsuarioScreen:tituloEdicao'), this.props.t('novoUsuarioScreen:erroEdicao'))
                } else {
                    this.props.form.resetFields()
                    this.openNotificationWithIcon('success', this.props.t('novoUsuarioScreen:tituloEdicao'), this.props.t('novoUsuarioScreen:sucessoEdicao'))
                    this.props.history.goBack()
                }
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
                    const { error } = response.data
                    console.error(error.message)
                }
            })
            .catch(this.catchRequestError)
    }

    renderFormulario() {
        const { getFieldDecorator } = this.props.form
        return (
            <Form onSubmit={this.onSubmit}>
                <Row>
                    <Col span={12}>
                        <h2 style={{ fontWeight: 200 }}>{this.props.t('novoUsuarioScreen:titulo')}</h2>
                    </Col>
                </Row>
                <Divider dashed />

                <Row gutter={8}>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                        <Col span={24}>
                            <span>{this.props.t('novoUsuarioScreen:nome')}</span>
                        </Col>
                        <Col span={24}>
                            <FormItem>
                                {getFieldDecorator('nome', {
                                    rules: [{
                                        required: true,
                                        message: this.props.t('novoUsuarioScreen:validacaoNome')
                                    }]
                                })(
                                    <Input placeholder="Marcelo Caxambu" type="text" />
                                )}
                            </FormItem>
                        </Col>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                        <Col span={24}>
                            <span>{this.props.t('novoUsuarioScreen:email')}</span>
                        </Col>
                        <Col span={24}>
                            <FormItem>
                                {getFieldDecorator('email', {
                                    rules: [{
                                        required: true,
                                        message: this.props.t('novoUsuarioScreen:validacaoEmail')
                                    }]
                                })(
                                    <Input placeholder="marcelo@gmail.com" type="email" />
                                )}
                            </FormItem>
                        </Col>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                        <Col span={24}>
                            <span>{this.props.t('novoUsuarioScreen:tipo')}</span>
                        </Col>
                        <Col span={24}>
                            <FormItem>
                                {getFieldDecorator('tipo', {
                                    initialValue: String(this.state.tipoUsuarioInicial),
                                    rules: [{
                                        required: true,
                                        message: this.props.t('novoUsuarioScreen:validacaoTipo')
                                    }]
                                })(
                                    <Select initialValue="2">
                                        <Option value="1">{this.props.t('novoUsuarioScreen:tipoCurador')}</Option>
                                        <Option value="2">{this.props.t('novoUsuarioScreen:tipoOperador')}</Option>
                                        <Option value="3">{this.props.t('novoUsuarioScreen:tipoIdentificador')}</Option>
                                    </Select>
                                )}
                            </FormItem>
                        </Col>
                    </Col>
                </Row>
                <Row gutter={8}>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                        <Col span={24}>
                            <span>{this.props.t('novoUsuarioScreen:ra')}</span>
                        </Col>
                        <Col span={24}>
                            <FormItem>
                                {getFieldDecorator('ra', {
                                    rules: [{
                                        required: false
                                    }]
                                })(
                                    <Input placeholder="877405" type="text" />
                                )}
                            </FormItem>
                        </Col>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                        <Col span={24}>
                            <span>{this.props.t('novoUsuarioScreen:telefone')}</span>
                        </Col>
                        <Col span={24}>
                            <FormItem>
                                {getFieldDecorator('telefone', {
                                    rules: [{
                                        required: false
                                    }]
                                })(
                                    <Input placeholder="+5544999682514" type="phone" />
                                )}
                            </FormItem>
                        </Col>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                        <Col span={24}>
                            <span>{this.props.t('novoUsuarioScreen:senha')}</span>
                        </Col>
                        <Col span={24}>
                            <FormItem>
                                {getFieldDecorator('password')(
                                    <Input type="password" placeholder="123456" />
                                )}
                            </FormItem>
                        </Col>
                    </Col>
                </Row>

                <Row type="flex" justify="end">
                    <Col xs={24} sm={12} md={8} lg={4} xl={4}>
                        <FormItem>
                            <Button
                                type="primary"
                                htmlType="submit"
                                className="login-form-button"
                            >
                                {this.props.t('novoUsuarioScreen:salvar')}
                            </Button>
                        </FormItem>
                    </Col>
                </Row>

                <Divider dashed />
            </Form>
        )
    }

    render() {
        if (this.state.loading) {
            return (
                <Spin tip={this.props.t('common:carregando')}>
                    {this.renderFormulario()}
                </Spin>
            )
        }
        return (
            this.renderFormulario()
        )
    }
}

export default withTranslation()(Form.create()(NovoUsuarioScreen))
