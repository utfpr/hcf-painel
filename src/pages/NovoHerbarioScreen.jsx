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
import { withTranslation } from 'react-i18next'

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
                    this.notificacao('warning', this.props.t('common:tituloFalha'), response.data.error.message)
                } else {
                    this.notificacao('error', this.props.t('common:tituloFalha'), this.props.t('novoHerbarioScreen:erroBuscarPaises'))
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
                    this.notificacao('warning', this.props.t('common:tituloFalha'), response.data.error.message)
                } else {
                    this.notificacao('error', this.props.t('common:tituloFalha'), this.props.t('novoHerbarioScreen:erroBuscarEstados'))
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
                    this.notificacao('warning', this.props.t('common:tituloFalha'), response.data.error.message)
                } else {
                    this.notificacao('error', this.props.t('common:tituloFalha'), this.props.t('novoHerbarioScreen:erroBuscarCidades'))
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

    handleCancelar = () => {
        this.props.history.push('/herbarios')
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
                        this.notificacao('warning', this.props.t('common:tituloFalha'), response.data.error.message)
                    } else {
                        this.notificacao('error', this.props.t('common:tituloFalha'), this.props.t('novoHerbarioScreen:erroCadastro'))
                    }
                    const { error } = response.data
                    throw new Error(error.message)
                } else {
                    throw err
                }
            })
            .catch(() => {
                this.notificacao('error', this.props.t('common:tituloFalha'), this.props.t('novoHerbarioScreen:erroCadastro'))
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
                    this.notificacao('warning', this.props.t('common:tituloFalha'), response.data.error.message)
                } else {
                    this.notificacao('error', this.props.t('common:tituloFalha'), this.props.t('novoHerbarioScreen:erroBuscarHerbario'))
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
                        this.notificacao('warning', this.props.t('common:tituloFalha'), response.data.error.message)
                    } else {
                        this.notificacao('error', this.props.t('common:tituloFalha'), this.props.t('novoHerbarioScreen:erroAtualizacao'))
                    }
                    const { error } = response.data
                    throw new Error(error.message)
                } else {
                    throw err
                }
            })
            .catch(() => {
                this.notificacao('error', this.props.t('common:tituloFalha'), this.props.t('novoHerbarioScreen:erroAtualizacao'))
            })
    }

    renderFormulario() {
        const { getFieldDecorator } = this.props.form
        const { paises, estados, cidades, fetchingPaises, fetchingEstados, fetchingCidades, paisSelecionado, estadoSelecionado } = this.state

        return (
            <Form onSubmit={this.onSubmit}>
                <Row>
                    <Col span={12}>
                        <h2 style={{ fontWeight: 200 }}>{this.props.t('novoHerbarioScreen:titulo')}</h2>
                    </Col>
                </Row>
                <Divider dashed />

                <Row gutter={8}>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                        <Col span={24}>
                            <span>{this.props.t('novoHerbarioScreen:nome')}</span>
                        </Col>
                        <Col span={24}>
                            <FormItem>
                                {getFieldDecorator('nome', {
                                    rules: [{
                                        required: true,
                                        message: this.props.t('novoHerbarioScreen:validacaoNome')
                                    }]
                                })(
                                    <Input placeholder="Herbário do Centro Federal" type="text" />
                                )}
                            </FormItem>
                        </Col>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                        <Col span={24}>
                            <span>{this.props.t('novoHerbarioScreen:sigla')}</span>
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
                            <span>{this.props.t('novoHerbarioScreen:email')}</span>
                        </Col>
                        <Col span={24}>
                            <FormItem>
                                {getFieldDecorator('email', {
                                    rules: [{
                                        required: true,
                                        message: this.props.t('novoHerbarioScreen:validacaoEmail')
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
                            <span>{this.props.t('novoHerbarioScreen:endereco')}</span>
                        </Col>
                        <Col span={24}>
                            <FormItem>
                                {getFieldDecorator('logradouro', {
                                    rules: [{
                                        required: true,
                                        message: this.props.t('novoHerbarioScreen:validacaoEndereco')
                                    }]
                                })(
                                    <Input placeholder="Av. das torres" type="text" />
                                )}
                            </FormItem>
                        </Col>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                        <Col span={24}>
                            <span>{this.props.t('novoHerbarioScreen:numero')}</span>
                        </Col>
                        <Col span={24}>
                            <FormItem>
                                {getFieldDecorator('numero', {
                                    rules: [{
                                        required: true,
                                        message: this.props.t('novoHerbarioScreen:validacaoNumero')
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
                        title={this.props.t('novoHerbarioScreen:pais')}
                        placeholder={this.props.t('novoHerbarioScreen:selecionePais')}
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
                            notFoundContent: fetchingPaises ? <Spin size="small" /> : this.props.t('common:nenhumResultadoEncontrado'),
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
                            message: this.props.t('novoHerbarioScreen:validacaoPais')
                        }]}
                    >
                        {paises.map(item => (
                            <Select.Option key={item.id} value={item.id}>{item.nome}</Select.Option>
                        ))}
                    </SelectedFormField>

                    <SelectedFormField
                        title={this.props.t('novoHerbarioScreen:estado')}
                        placeholder={paisSelecionado ? this.props.t('novoHerbarioScreen:selecioneEstado') : this.props.t('novoHerbarioScreen:selecionePaisPrimeiro')}
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
                            notFoundContent: fetchingEstados ? <Spin size="small" /> : this.props.t('common:nenhumResultadoEncontrado'),
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
                            message: this.props.t('novoHerbarioScreen:validacaoEstado')
                        }]}
                    >
                        {estados.map(item => (
                            <Select.Option key={item.id} value={item.id}>{item.nome}</Select.Option>
                        ))}
                    </SelectedFormField>

                    <SelectedFormField
                        title={this.props.t('novoHerbarioScreen:cidade')}
                        placeholder={estadoSelecionado ? this.props.t('novoHerbarioScreen:selecioneCidade') : this.props.t('novoHerbarioScreen:selecioneEstadoPrimeiro')}
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
                            notFoundContent: fetchingCidades ? <Spin size="small" /> : this.props.t('common:nenhumResultadoEncontrado'),
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
                            message: this.props.t('novoHerbarioScreen:validacaoCidade')
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
                            <span>{this.props.t('novoHerbarioScreen:complemento')}</span>
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

                <Row type="flex" justify="end" gutter={8}>
                    <Col xs={24} sm={8} md={4} lg={4} xl={4}>
                        <FormItem>
                            <Button
                                style={{ width: '100%' }}
                                onClick={this.handleCancelar}
                            >
                                {this.props.t('common:cancelar')}
                            </Button>
                        </FormItem>
                    </Col>

                    <Col xs={24} sm={8} md={4} lg={4} xl={4}>
                        <FormItem>
                            <Button
                                type="primary"
                                htmlType="submit"
                                style={{ width: '100%' }}
                            >
                                {this.props.t('novoHerbarioScreen:salvar')}
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

export default withTranslation()(Form.create()(NovoHerbarioScreen))
