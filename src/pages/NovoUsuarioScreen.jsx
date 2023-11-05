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
                this.openNotificationWithIcon('error', 'Falha', 'Informe a senha do usuário.')
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
                    this.openNotificationWithIcon('error', 'Cadastro', 'Houve um problema ao realizar o cadastro, verifique os dados e tente novamente.')
                } else {
                    this.props.form.resetFields()
                    this.openNotificationWithIcon('success', 'Cadastro', 'O usuário foi cadastrado com sucesso.')
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
                this.openNotificationWithIcon('error', 'Cadastro', 'Houve um problema ao realizar o cadastro, o email deve ser único por usuário, verifique os dados e tente novamente.')

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
                    this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao buscar os dados do usuário, tente novamente.')
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
                    this.openNotificationWithIcon('error', 'Edição', 'Houve um problema ao realizar a edição, verifique os dados e tente novamente.')
                } else {
                    this.props.form.resetFields()
                    this.openNotificationWithIcon('success', 'Edição', 'O usuário foi alterado com sucesso.')
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
                        <h2 style={{ fontWeight: 200 }}>Usuário</h2>
                    </Col>
                </Row>
                <Divider dashed />

                <Row gutter={8}>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                        <Col span={24}>
                            <span>Nome:</span>
                        </Col>
                        <Col span={24}>
                            <FormItem>
                                {getFieldDecorator('nome', {
                                    rules: [{
                                        required: true,
                                        message: 'Insira o nome do usuário'
                                    }]
                                })(
                                    <Input placeholder="Marcelo Caxambu" type="text" />
                                )}
                            </FormItem>
                        </Col>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                        <Col span={24}>
                            <span>Email:</span>
                        </Col>
                        <Col span={24}>
                            <FormItem>
                                {getFieldDecorator('email', {
                                    rules: [{
                                        required: true,
                                        message: 'Insira o email do usuário'
                                    }]
                                })(
                                    <Input placeholder="marcelo@gmail.com" type="email" />
                                )}
                            </FormItem>
                        </Col>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                        <Col span={24}>
                            <span>Tipo:</span>
                        </Col>
                        <Col span={24}>
                            <FormItem>
                                {getFieldDecorator('tipo', {
                                    initialValue: String(this.state.tipoUsuarioInicial),
                                    rules: [{
                                        required: true,
                                        message: 'Selecione o tipo do usuário'
                                    }]
                                })(
                                    <Select initialValue="2">
                                        <Option value="1">Curador</Option>
                                        <Option value="2">Operador</Option>
                                        <Option value="3">Identificador</Option>
                                    </Select>
                                )}
                            </FormItem>
                        </Col>
                    </Col>
                </Row>
                <Row gutter={8}>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                        <Col span={24}>
                            <span>RA:</span>
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
                            <span>Telefone:</span>
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
                            <span>Senha:</span>
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
                                Salvar
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
                <Spin tip="Carregando...">
                    {this.renderFormulario()}
                </Spin>
            )
        }
        return (
            this.renderFormulario()
        )
    }
}

export default Form.create()(NovoUsuarioScreen)
