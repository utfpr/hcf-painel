import { Component } from 'react'

import {

    Row,
    Col,
    Divider,
    Input,
    Button,
    Select,
    notification,
    InputNumber,
    Spin
} from 'antd'
import axios from 'axios'

import { Form } from '@ant-design/compatible'

const FormItem = Form.Item
const { Option } = Select
const { TextArea } = Input

class NovoHerbarioScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: false,
            cidades: [],
            estados: [],
            paises: [],
            cidadeInicial: '',
            estadoInicial: '',
            paisInicial: ''
        }
    }

    formataDadosPais = () => this.state.paises.map(item => <Option key={`${item.id}`}>{item.nome}</Option>)

    formataDadosEstados = () => this.state.estados.map(item => <Option key={`${item.id}`}>{item.nome}</Option>)

    formataDadosCidades = () => this.state.cidades.map(item => <Option key={item.id}>{item.nome}</Option>)

    requisitaPaises = () => {
        this.setState({
            loading: true
        })
        axios.get('/paises')
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.data && response.status === 200) {
                    this.setState({
                        paises: response.data
                    })
                }
            })
            .catch(err => {
                this.setState({
                    loading: false
                })
                const { response } = err
                if (response && response.data) {
                    if (response.status === 400 || response.status === 422) {
                        this.notificacao('warning', 'Falha', response.data.error.message)
                    } else {
                        this.notificacao('error', 'Falha', 'Houve um problema ao buscar os países, tente novamente.')
                    }
                    const { error } = response.data
                    throw new Error(error.message)
                } else {
                    throw err
                }
            })
            .catch(() => {
                this.notificacao('error', 'Falha', 'Houve um problema ao requisitar os paises, tente novamente.')
            })
    }

    requisitaEstados = id => {
        this.setState({
            loading: true
        })
        axios.get('/estados', {
            params: {
                id
            }
        })
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.data && response.status === 200) {
                    this.setState({
                        estados: response.data
                    })
                }
            })
            .catch(err => {
                this.setState({
                    loading: false
                })
                const { response } = err
                if (response && response.data) {
                    if (response.status === 400 || response.status === 422) {
                        this.notificacao('warning', 'Falha', response.data.error.message)
                    } else {
                        this.notificacao('error', 'Falha', 'Houve um problema ao buscar os estados, tente novamente.')
                    }
                    const { error } = response.data
                    throw new Error(error.message)
                } else {
                    throw err
                }
            })
            .catch(() => {
                this.notificacao('error', 'Falha', 'Houve um problema ao requisitar os estados, tente novamente.')
            })
    }

    requisitaCidades = id => {
        this.setState({
            loading: true
        })
        axios.get('/cidades', {
            params: {
                id
            }
        })
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.data && response.status === 200) {
                    this.setState({
                        cidades: response.data
                    })
                }
            })
            .catch(err => {
                this.setState({
                    loading: false
                })
                const { response } = err
                if (response && response.data) {
                    if (response.status === 400 || response.status === 422) {
                        this.notificacao('warning', 'Falha', response.data.error.message)
                    } else {
                        this.notificacao('error', 'Falha', 'Houve um problema ao buscar as cidades, tente novamente.')
                    }
                    const { error } = response.data
                    throw new Error(error.message)
                } else {
                    throw err
                }
            })
            .catch(() => {
                this.notificacao('error', 'Falha', 'Houve um problema ao requisitar as cidades, tente novamente.')
            })
    }

    componentDidMount() {
        this.requisitaPaises()
        if (this.props.match.params.herbario_id !== undefined) {
            this.requisitaHerbario()
            this.setState({
                loading: true
            })
        }
    }

    notificacao = (type, message, description) => {
        notification[type]({
            message,
            description
        })
    }

    handleSubmit = (err, valores) => {
        if (!err) {
            if (this.props.match.params.herbario_id !== undefined) {
                this.requisitaEdicaoHerbario(valores)
            } else {
                this.requisitaCadastroHerbario(valores)
            }
        }
    }

    onSubmit = event => {
        event.preventDefault()
        this.props.form.validateFields(this.handleSubmit)
    }

    requisitaCadastroHerbario = valores => {
        this.setState({
            loading: true
        })
        const {
            nome,
            sigla,
            email,
            logradouro,
            numero,
            cidade,
            complemento
        } = valores

        const json = {
            herbario: {},
            endereco: {}
        }

        if (nome) json.herbario.nome = nome
        if (sigla) json.herbario.sigla = sigla
        if (email) json.herbario.email = email
        if (cidade) json.endereco.cidade_id = cidade
        if (logradouro) json.endereco.logradouro = logradouro
        if (numero) json.endereco.numero = numero
        if (complemento) json.endereco.complemento = complemento

        axios.post('/herbarios', json)
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 201) {
                    this.props.history.goBack()
                }
            })
            .catch(err => {
                this.setState({
                    loading: false
                })
                const { response } = err
                if (response && response.data) {
                    if (response.status === 400 || response.status === 422) {
                        this.notificacao('warning', 'Falha', response.data.error.message)
                    } else {
                        this.notificacao('error', 'Falha', 'Houve um problema ao cadastrar o herbários, tente novamente.')
                    }
                    const { error } = response.data
                    throw new Error(error.message)
                } else {
                    throw err
                }
            })
            .catch(() => {
                this.notificacao('error', 'Falha', 'Houve um problema ao cadastrar o herbário, tente novamente.')
            })
    }

    requisitaHerbario = () => {
        this.setState({
            loading: true
        })
        axios.get(`/herbarios/${this.props.match.params.herbario_id}`)
            .then(response => {
                const {
                    nome, email, sigla, endereco
                } = response.data.herbario
                const { paises, cidades, estados } = response.data

                if (response.status === 200) {
                    this.setState({
                        cidades,
                        estados,
                        paises
                    })
                    if (endereco !== null) {
                        this.setState({
                            paisInicial: endereco.cidade.estado.paise.id,
                            estadoInicial: endereco.cidade.estado.id,
                            cidadeInicial: endereco.cidade.id
                        })
                        this.props.form.setFields({
                            logradouro: { value: endereco.logradouro },
                            numero: { value: endereco.numero },
                            complemento: { value: endereco.complemento }
                        })
                    }

                    this.props.form.setFields({
                        nome: { value: nome },
                        email: { value: email },
                        sigla: { value: sigla }
                    })
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
                    if (response.status === 400 || response.status === 422) {
                        this.notificacao('warning', 'Falha', response.data.error.message)
                    } else {
                        this.notificacao('error', 'Falha', 'Houve um problema ao buscar os dados do herbário, tente novamente.')
                    }
                    const { error } = response.data
                    console.error(error.message)
                } else {
                    throw err
                }
            })
    }

    requisitaEdicaoHerbario = valores => {
        this.setState({
            loading: true
        })
        const {
            nome,
            sigla,
            email,
            logradouro,
            numero,
            cidade,
            complemento
        } = valores

        const json = {
            herbario: {},
            endereco: {}
        }

        if (nome) json.herbario.nome = nome
        if (sigla) json.herbario.sigla = sigla
        if (email) json.herbario.email = email
        if (cidade) json.endereco.cidade_id = cidade
        if (logradouro) json.endereco.logradouro = logradouro
        if (numero) json.endereco.numero = numero
        if (complemento) json.endereco.complemento = complemento

        axios.put(`/herbarios/${this.props.match.params.herbario_id}`, json)
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 200) {
                    this.props.history.goBack()
                }
            })
            .catch(err => {
                this.setState({
                    loading: false
                })
                const { response } = err
                if (response && response.data) {
                    if (response.status === 400 || response.status === 422) {
                        this.notificacao('warning', 'Falha', response.data.error.message)
                    } else {
                        this.notificacao('error', 'Falha', 'Houve um problema ao atualizar o herbário, tente novamente.')
                    }
                    const { error } = response.data
                    throw new Error(error.message)
                } else {
                    throw err
                }
            })
            .catch(() => {
                this.notificacao('error', 'Falha', 'Houve um problema ao atualizar o herbário, tente novamente.')
            })
    }

    renderFormulario() {
        const { getFieldDecorator } = this.props.form
        return (
            <Form onSubmit={this.onSubmit}>
                <Row>
                    <Col span={12}>
                        <h2 style={{ fontWeight: 200 }}>Herbário</h2>
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
                                        message: 'Insira o nome do herbário'
                                    }]
                                })(
                                    <Input placeholder="Herbário do Centro Federal" type="text" />
                                )}
                            </FormItem>
                        </Col>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                        <Col span={24}>
                            <span>Sigla:</span>
                        </Col>
                        <Col span={24}>
                            <FormItem>
                                {getFieldDecorator('sigla')(
                                    <Input placeholder="HCF" type="text" />
                                )}
                            </FormItem>
                        </Col>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                        <Col span={24}>
                            <span>E-mail:</span>
                        </Col>
                        <Col span={24}>
                            <FormItem>
                                {getFieldDecorator('email', {
                                    rules: [{
                                        required: true,
                                        message: 'Insira o e-mail do herbário'
                                    }]
                                })(
                                    <Input placeholder="hcfcampomourao@gmail.com" type="text" />
                                )}
                            </FormItem>
                        </Col>
                    </Col>
                </Row>
                <Row gutter={8}>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                        <Col span={24}>
                            <span>Endereço:</span>
                        </Col>
                        <Col span={24}>
                            <FormItem>
                                {getFieldDecorator('logradouro', {
                                    rules: [{
                                        required: true,
                                        message: 'Insira o logradouro do herbário'
                                    }]
                                })(
                                    <Input placeholder="Av. das torres" type="text" />
                                )}
                            </FormItem>
                        </Col>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                        <Col span={24}>
                            <span>Número:</span>
                        </Col>
                        <Col span={24}>
                            <FormItem>
                                {getFieldDecorator('numero', {
                                    rules: [{
                                        required: true,
                                        message: 'Insira o numero do logradouro do herbário'
                                    }]
                                })(
                                    <InputNumber min={1} placeholder={1920} style={{ width: '100%' }} />
                                )}
                            </FormItem>
                        </Col>
                    </Col>
                </Row>
                <Row gutter={8}>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                        <Col span={24}>
                            <span>País:</span>
                        </Col>
                        <Col span={24}>
                            <FormItem>
                                {getFieldDecorator('pais', {
                                    initialValue: String(this.state.paisInicial),
                                    rules: [{
                                        required: true,
                                        message: 'Selecione ou insira um pais'
                                    }]
                                })(
                                    <Select
                                        showSearch
                                        placeholder="Selecione um país"
                                        optionFilterProp="children"
                                        style={{ width: '100%' }}
                                        onChange={value => {
                                            this.requisitaEstados(value)
                                        }}
                                    >
                                        {this.formataDadosPais()}
                                    </Select>
                                )}
                            </FormItem>
                        </Col>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                        <Col span={24}>
                            <span>Estado:</span>
                        </Col>
                        <Col span={24}>
                            <FormItem>
                                {getFieldDecorator('estado', {
                                    initialValue: String(this.state.estadoInicial),
                                    rules: [{
                                        required: true,
                                        message: 'Selecione ou insira um estado'
                                    }]
                                })(
                                    <Select
                                        showSearch
                                        style={{ width: '100%' }}
                                        placeholder="Paraná"
                                        optionFilterProp="children"
                                        onChange={value => {
                                            this.requisitaCidades(value)
                                        }}
                                    >
                                        {this.formataDadosEstados()}
                                    </Select>
                                )}
                            </FormItem>
                        </Col>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                        <Col span={24}>
                            <span>Cidade:</span>
                        </Col>
                        <Col span={24}>
                            <FormItem>
                                {getFieldDecorator('cidade', {
                                    initialValue: String(this.state.cidadeInicial),
                                    rules: [{
                                        required: true,
                                        message: 'Selecione ou insira uma cidade'
                                    }]
                                })(
                                    <Select
                                        showSearch
                                        style={{ width: '100%' }}
                                        placeholder="Campo Mourão"
                                        optionFilterProp="children"
                                    >
                                        {this.formataDadosCidades()}
                                    </Select>
                                )}
                            </FormItem>
                        </Col>
                    </Col>
                </Row>
                <Row gutter={8}>
                    <Col xs={24} sm={16} md={16} lg={16} xl={16}>
                        <Col span={24}>
                            <span>Complemento de localização:</span>
                        </Col>
                        <Col span={24}>
                            <FormItem>
                                {getFieldDecorator('complemento')(
                                    <TextArea rows={4} />
                                )}
                            </FormItem>
                        </Col>
                    </Col>
                </Row>

                <Row type="flex" justify="end">
                    <Col xs={24} sm={8} md={8} lg={4} xl={4}>
                        {' '}
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

export default Form.create()(NovoHerbarioScreen)
