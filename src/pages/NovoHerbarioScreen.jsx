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
import SelectedFormField from './tombos/components/SelectedFormFiled'

const FormItem = Form.Item
const { TextArea } = Input
const { Option } = Select

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
            paisInicial: '',
            paisSelecionado: null,
            estadoSelecionado: null,
            fetchingPaises: false,
            fetchingEstados: false,
            fetchingCidades: false
        }
    }

    requisitaPaises = async (searchText = '') => {
        this.setState({ fetchingPaises: true })

        try {
            const params = {
                ...(searchText ? { nome: searchText } : {})
            }

            const response = await axios.get('/paises', { params })
            
            if (response.status === 200) {
                this.setState({
                    paises: response.data,
                    fetchingPaises: false
                })
            }
        } catch (err) {
            this.setState({ fetchingPaises: false })
            const { response } = err
            if (response && response.data) {
                if (response.status === 400 || response.status === 422) {
                    this.notificacao('warning', 'Falha', response.data.error.message)
                } else {
                    this.notificacao('error', 'Falha', 'Houve um problema ao buscar os países, tente novamente.')
                }
            }
        }
    }

    requisitaEstados = async (searchText = '', paisId = null) => {
        this.setState({ fetchingEstados: true })

        try {
            const params = {
                ...(paisId ? { pais_id: paisId } : {}),
                ...(searchText ? { nome: searchText } : {})
            }

            const response = await axios.get('/estados', { params })
            
            if (response.status === 200) {
                this.setState({
                    estados: response.data,
                    fetchingEstados: false
                })
            }
        } catch (err) {
            this.setState({ fetchingEstados: false })
            const { response } = err
            if (response && response.data) {
                if (response.status === 400 || response.status === 422) {
                    this.notificacao('warning', 'Falha', response.data.error.message)
                } else {
                    this.notificacao('error', 'Falha', 'Houve um problema ao buscar os estados, tente novamente.')
                }
            }
        }
    }

    requisitaCidades = async (searchText = '', estadoId = null) => {
        this.setState({ fetchingCidades: true })

        try {
            const params = {
                ...(estadoId ? { estado_id: estadoId } : {}),
                ...(searchText ? { nome: searchText } : {})
            }

            const response = await axios.get('/cidades', { params })
            
            if (response.status === 200) {
                this.setState({
                    cidades: response.data,
                    fetchingCidades: false
                })
            }
        } catch (err) {
            this.setState({ fetchingCidades: false })
            const { response } = err
            if (response && response.data) {
                if (response.status === 400 || response.status === 422) {
                    this.notificacao('warning', 'Falha', response.data.error.message)
                } else {
                    this.notificacao('error', 'Falha', 'Houve um problema ao buscar as cidades, tente novamente.')
                }
            }
        }
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

    requisitaHerbario = async () => {
        this.setState({
            loading: true
        })
        
        try {
            const response = await axios.get(`/herbarios/${this.props.match.params.herbario_id}`)
            
            if (response.status === 200) {
                const {
                    nome, email, sigla, endereco
                } = response.data.herbario
                const { paises, cidades, estados } = response.data

                this.setState({
                    cidades,
                    estados,
                    paises
                })
                
                if (endereco !== null) {
                    const paisId = endereco.cidade.estado.paise.id
                    const estadoId = endereco.cidade.estado.id
                    
                    await this.requisitaEstados('', paisId)
                    await this.requisitaCidades('', estadoId)
                    
                    this.setState({
                        paisInicial: paisId,
                        estadoInicial: estadoId,
                        cidadeInicial: endereco.cidade.id,
                        paisSelecionado: paisId,
                        estadoSelecionado: estadoId
                    })
                    
                    this.props.form.setFieldsValue({
                        pais: paisId,
                        estado: estadoId,
                        cidade: endereco.cidade.id,
                        logradouro: endereco.logradouro,
                        numero: endereco.numero,
                        complemento: endereco.complemento
                    })
                }

                this.props.form.setFieldsValue({
                    nome: nome,
                    email: email,
                    sigla: sigla
                })
                
                this.setState({
                    loading: false
                })
            }
        } catch (err) {
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
        }
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
        const { paises, estados, cidades, fetchingPaises, fetchingEstados, fetchingCidades, paisSelecionado, estadoSelecionado } = this.state

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
                    <SelectedFormField
                        title="País:"
                        placeholder="Selecione um país"
                        fieldName="pais"
                        getFieldDecorator={getFieldDecorator}
                        onSearch={searchText => {
                            this.requisitaPaises(searchText || '')
                        }}
                        onChange={async value => {
                            this.setState({ 
                                paisSelecionado: value,
                                estadoSelecionado: null,
                                estados: [],
                                cidades: []
                            })
                            this.props.form.setFieldsValue({
                                estado: undefined,
                                cidade: undefined
                            })
                            if (value) {
                                await this.requisitaEstados('', value)
                            }
                        }}
                        others={{
                            loading: fetchingPaises,
                            notFoundContent: fetchingPaises ? <Spin size="small" /> : 'Nenhum resultado encontrado',
                            allowClear: true
                        }}
                        debounceDelay={200}
                        xs={24}
                        sm={12}
                        md={8}
                        lg={8}
                        xl={8}
                        rules={[{
                            required: true,
                            message: 'Selecione ou insira um país'
                        }]}
                    >
                        {paises.map(item => (
                            <Select.Option key={item.id} value={item.id}>{item.nome}</Select.Option>
                        ))}
                    </SelectedFormField>

                    <SelectedFormField
                        title="Estado:"
                        placeholder={paisSelecionado ? "Selecione um estado" : "Selecione um país primeiro"}
                        fieldName="estado"
                        getFieldDecorator={getFieldDecorator}
                        disabled={!paisSelecionado}
                        onSearch={searchText => {
                            if (paisSelecionado) {
                                this.requisitaEstados(searchText || '', paisSelecionado)
                            }
                        }}
                        onChange={async value => {
                            this.setState({ 
                                estadoSelecionado: value,
                                cidades: []
                            })
                            this.props.form.setFieldsValue({
                                cidade: undefined
                            })
                            if (value) {
                                await this.requisitaCidades('', value)
                            }
                        }}
                        others={{
                            loading: fetchingEstados,
                            notFoundContent: fetchingEstados ? <Spin size="small" /> : 'Nenhum resultado encontrado',
                            allowClear: true
                        }}
                        debounceDelay={200}
                        xs={24}
                        sm={12}
                        md={8}
                        lg={8}
                        xl={8}
                        rules={[{
                            required: true,
                            message: 'Selecione ou insira um estado'
                        }]}
                    >
                        {estados.map(item => (
                            <Select.Option key={item.id} value={item.id}>{item.nome}</Select.Option>
                        ))}
                    </SelectedFormField>

                    <SelectedFormField
                        title="Cidade:"
                        placeholder={estadoSelecionado ? "Selecione uma cidade" : "Selecione um estado primeiro"}
                        fieldName="cidade"
                        getFieldDecorator={getFieldDecorator}
                        disabled={!estadoSelecionado}
                        onSearch={searchText => {
                            if (estadoSelecionado) {
                                this.requisitaCidades(searchText || '', estadoSelecionado)
                            }
                        }}
                        others={{
                            loading: fetchingCidades,
                            notFoundContent: fetchingCidades ? <Spin size="small" /> : 'Nenhum resultado encontrado',
                            allowClear: true
                        }}
                        debounceDelay={200}
                        xs={24}
                        sm={12}
                        md={8}
                        lg={8}
                        xl={8}
                        rules={[{
                            required: true,
                            message: 'Selecione ou insira uma cidade'
                        }]}
                    >
                        {cidades.map(item => (
                            <Select.Option key={item.id} value={item.id}>{item.nome}</Select.Option>
                        ))}
                    </SelectedFormField>
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
