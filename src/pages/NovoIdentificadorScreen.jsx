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
const { TextArea } = Input

class NovoIdentificadorScreen extends Component {
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

    async componentDidMount() {
        if (this.props.match.params.identificador_id !== undefined) {
            await this.buscarIdentificadorPorId()
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
            if (this.props.match.params.identificador_id !== undefined) {
                this.requisitaEdicaoIdentificador(valores)
            } else {
                this.requisitaCadastroIdentificador(valores)
            }
        }
    }

    onSubmit = event => {
        event.preventDefault()
        this.props.form.validateFields(this.handleSubmit)
    }

    requisitaCadastroIdentificador = async valores => {
        this.setState({
            loading: true
        })

        try {
            await axios.post('/identificadores', valores)
        } catch (err) {
            this.notificacao('error', 'Falha', 'Houve um problema ao cadastrar o identificador, tente novamente.')
        } finally {
            this.setState({ loading: false })
        }
    }

    buscarIdentificadorPorId = async () => {
        try {
            this.setState({ loading: true })

            const { data } = await axios.get(`/identificadores/${this.props.match.params.identificador_id}`)

            this.props.form.setFields({
                nome: { value: data.nome }
            })
        } catch (err) {
            this.notificacao('error', 'Falha', 'Houve um problema ao buscar os dados do identificador, tente novamente.')
        } finally {
            this.setState({ loading: false })
        }
    }

    requisitaEdicaoIdentificador = async valores => {
        this.setState({ loading: true })

        try {
            await axios.put(`/identificadores/${this.props.match.params.identificador_id}`, valores)
        } catch (err) {
            this.notificacao('error', 'Falha', 'Houve um problema ao atualizar o identificador, tente novamente.')
        } finally {
            this.setState({ loading: false })
        }

        // const {
        //     nome,
        //     sigla,
        //     email,
        //     logradouro,
        //     numero,
        //     cidade,
        //     complemento
        // } = valores

        // const json = {
        //     herbario: {},
        //     endereco: {}
        // }

        // if (nome) json.herbario.nome = nome
        // if (sigla) json.herbario.sigla = sigla
        // if (email) json.herbario.email = email
        // if (cidade) json.endereco.cidade_id = cidade
        // if (logradouro) json.endereco.logradouro = logradouro
        // if (numero) json.endereco.numero = numero
        // if (complemento) json.endereco.complemento = complemento

        // axios.put(`/herbarios/${this.props.match.params.herbario_id}`, json)
        //     .then(response => {
        //         this.setState({
        //             loading: false
        //         })
        //         if (response.status === 200) {
        //             this.props.history.goBack()
        //         }
        //     })
        //     .catch(err => {
        //         this.setState({
        //             loading: false
        //         })
        //         const { response } = err
        //         if (response && response.data) {
        //             if (response.status === 400 || response.status === 422) {
        //                 this.notificacao('warning', 'Falha', response.data.error.message)
        //             } else {
        //                 this.notificacao('error', 'Falha', 'Houve um problema ao atualizar o herbário, tente novamente.')
        //             }
        //             const { error } = response.data
        //             throw new Error(error.message)
        //         } else {
        //             throw err
        //         }
        //     })
        //     .catch(() => {
        //         this.notificacao('error', 'Falha', 'Houve um problema ao atualizar o herbário, tente novamente.')
        //     })
    }

    renderFormulario() {
        const { getFieldDecorator } = this.props.form
        return (
            <Form onSubmit={this.onSubmit}>
                <Row>
                    <Col span={12}>
                        <h2 style={{ fontWeight: 200 }}>Identificador</h2>
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
                                    <Input placeholder="D. Zappi" type="text" />
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

export default Form.create()(NovoIdentificadorScreen)
