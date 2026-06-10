import { Component } from 'react'

import {
    Divider, Spin, Modal, Card, Row, Col,
    Select, Input, Button, notification
} from 'antd'
import axios from 'axios'
import { withTranslation } from 'react-i18next'

import TotalRecordFound from '@/components/TotalRecordsFound'
import { recaptchaKey } from '@/config/api'
import { Form } from '@ant-design/compatible'
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'

import ModalCadastroComponent from '../components/ModalCadastroComponent'
import SimpleTableComponent from '../components/SimpleTableComponent'
import { isCuradorOuOperador } from '../helpers/usuarios'
import SelectedFormField from './tombos/components/SelectedFormFiled'

const { confirm } = Modal
const FormItem = Form.Item
const { Option } = Select

class ListaTaxonomiaGenero extends Component {
    constructor(props) {
        super(props)
        this.state = {
            generos: [],
            metadados: {},
            reinos: [],
            familias: [],
            pagina: 1,
            visibleModal: false,
            loadingModal: false,
            loading: false,
            fetchingReinos: false,
            fetchingFamilias: false,
            reinoSelecionado: null,
            titulo: 'Cadastrar',
            id: -1
        }
    }

    requisitaExclusao(id) {
        this.setState({
            loading: true
        })
        axios.delete(`/generos/${id}`)
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 204) {
                    this.requisitaListaGenero(this.state.valores, this.state.pagina)
                    this.notificacao('success', this.props.t('common:notificacaoExcluir'), this.props.t('listaTaxonomiaGenero:sucessoExclusao'))
                }
            })
            .catch(err => {
                this.setState({
                    loading: false
                })
                const { response } = err
                if (response && response.data) {
                    const { error } = response.data
                    if (error && error.code) {
                        this.notificacao('error', this.props.t('listaTaxonomiaGenero:erroExcluirTitulo'), error.code)
                    } else {
                        this.notificacao('error', this.props.t('listaTaxonomiaGenero:erroExcluirTitulo'), this.props.t('listaTaxonomiaGenero:erroExcluirInesperado'))
                    }
                    console.error(error)
                } else {
                    this.notificacao('error', this.props.t('listaTaxonomiaGenero:erroExcluirTitulo'), this.props.t('common:erroComunicacaoServidor'))
                }
            })
    }

    notificacao = (type, titulo, descricao) => {
        notification[type]({
            message: titulo,
            description: descricao
        })
    }

    mostraMensagemDelete(id) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this
        confirm({
            title: this.props.t('listaTaxonomiaGenero:confirmarExclusaoTitulo'),
            content: this.props.t('listaTaxonomiaGenero:confirmarExclusaoDescricao'),
            okText: this.props.t('common:sim'),
            okType: 'danger',
            cancelText: this.props.t('common:nao'),
            onOk() {
                self.requisitaExclusao(id)
            },
            onCancel() {
            }
        })
    }

    componentDidMount() {
        this.requisitaListaGenero({}, this.state.pagina)
        this.requisitaReinos()
    }

    requisitaReinos = async (searchText = '') => {
        this.setState({ fetchingReinos: true })

        try {
            const params = {
                limite: 9999999,
                ...(searchText ? { reino: searchText } : {})
            }

            const isLogged = Boolean(localStorage.getItem('token'))

            if (!isLogged && window.grecaptcha && window.grecaptcha.ready) {
                await new Promise(resolve => window.grecaptcha.ready(resolve))
                const token = await window.grecaptcha.execute(recaptchaKey, { action: 'reinos' })
                params.recaptchaToken = token
            }

            const response = await axios.get('/reinos', { params })

            if (response.status === 200) {
                this.setState({
                    reinos: response.data.resultado,
                    fetchingReinos: false
                })
            }
        } catch (err) {
            this.setState({ fetchingReinos: false })
            const { response } = err
            if (response && response.data) {
                const { error } = response.data
                console.error(error.message)
            }
            this.notificacao('error', this.props.t('common:erro'), this.props.t('listaTaxonomiaGenero:falhaBuscarReinos'))
        }
    }

    gerarAcao(item) {
        if (isCuradorOuOperador()) {
            return (
                <span>
                    <Divider type="vertical" />
                    <a
                        href="#"
                        onClick={async () => {
                            const reinoId = item.familia.reino.id || null

                            this.setState({
                                visibleModal: true,
                                id: item.id,
                                titulo: this.props.t('common:atualizar'),
                                reinoSelecionado: reinoId,
                                familiaIdEdicao: item.familia.id
                            })

                            if (reinoId) {
                                await this.requisitaFamilias('', reinoId)
                            }

                            this.props.form.setFieldsValue({
                                nomeGenero: item.nome,
                                nomeFamilia: item.familia.id,
                                nomeReino: reinoId
                            })
                        }}
                    >
                        <EditOutlined style={{ color: '#FFCC00' }} />
                    </a>
                    <Divider type="vertical" />
                    <a href="#" onClick={() => this.mostraMensagemDelete(item.id)}>
                        <DeleteOutlined style={{ color: '#e30613' }} />
                    </a>
                </span>
            )
        }

        return undefined
    }

    openNotificationWithIcon = (type, message, description) => {
        notification[type]({
            message,
            description
        })
    }

    formataDadosGenero = generos => generos.map(item => ({
        key: item.id,
        genero: item.nome,
        acao: this.gerarAcao(item),
        familia: item.familia?.nome,
        familiaId: item.familia?.id
    }))

    renderAdd = () => {
        if (isCuradorOuOperador()) {
            return (
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        this.props.form.resetFields()

                        this.setState({
                            visibleModal: true,
                            titulo: this.props.t('common:cadastrar'),
                            id: -1,
                            reinoSelecionado: null,
                            familias: []
                        })
                    }}
                    style={{ backgroundColor: '#5CB85C', borderColor: '#5CB85C', width: '100%' }}
                >
                    {this.props.t('common:cadastrar')}
                </Button>
            )
        }
        return undefined
    }

    requisitaListaGenero = async (valores, pg, pageSize, sorter) => {
        this.setState({ loading: true })

        try {
            const campo = sorter && sorter.field ? sorter.field : 'genero'
            const ordem = sorter && sorter.order === 'descend' ? 'desc' : 'asc'

            const params = {
                pagina: pg,
                limite: pageSize || 20,
                order: `${campo}:${ordem}`,
                ...(valores && valores.genero ? { genero: valores.genero } : {}),
                ...(valores && valores.familia ? { familia_nome: valores.familia } : {})
            }

            const isLogged = Boolean(localStorage.getItem('token'))

            if (!isLogged && window.grecaptcha && window.grecaptcha.ready) {
                await new Promise(resolve => window.grecaptcha.ready(resolve))
                const token = await window.grecaptcha.execute(recaptchaKey, { action: 'generos' })
                params.recaptchaToken = token
            }

            const response = await axios.get('/generos', { params })

            if (response.status === 200) {
                const { data } = response
                this.setState({
                    generos: this.formataDadosGenero(data.resultado),
                    metadados: data.metadados,
                    loading: false
                })
            } else if (response.status === 400) {
                this.notificacao('warning', this.props.t('listaTaxonomiaGenero:buscarGenero'), this.props.t('listaTaxonomiaGenero:erroBuscarGeneros'))
                this.setState({ loading: false })
            } else {
                this.notificacao('error', this.props.t('common:error'), this.props.t('listaTaxonomiaGenero:erroServidorBuscarGeneros'))
                this.setState({ loading: false })
            }
        } catch (err) {
            this.setState({ loading: false })
            const { response } = err
            if (response && response.data) {
                const { error } = response.data
                console.error(error.message)
            }
            this.notificacao('error', this.props.t('common:erro'), this.props.t('listaTaxonomiaGenero:falhaBuscarGeneros'))
        }
    }

    handleSubmit = (err, valores) => {
        if (!err) {
            this.setState({
                valores,
                loading: true
            })
            this.requisitaListaGenero(valores, this.state.pagina)
        }
    }

    onSubmit = event => {
        event.preventDefault()
        this.props.form.validateFields(this.handleSubmit)
    }

    cadastraNovaGenero() {
        this.setState({
            loading: true
        })
        axios.post('/generos', {
            nome: this.props.form.getFieldsValue().nomeGenero,
            familia_id: this.props.form.getFieldsValue().nomeFamilia
        })
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 204) {
                    this.requisitaListaGenero()
                    this.openNotificationWithIcon('success', this.props.t('common:sucesso'), this.props.t('common:cadastroRealizadoSucesso'))
                } else if (response.status === 400) {
                    this.openNotificationWithIcon('warning', this.props.t('common:falha'), response.data.error.message)
                } else {
                    this.openNotificationWithIcon('error', this.props.t('common:falha'), this.props.t('listaTaxonomiaGenero:erroCadastroGenero'))
                }
                this.props.form.setFields({
                    nomeGenero: {
                        value: ''
                    }
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

    atualizaGenero() {
        this.setState({
            loading: true
        })

        const formValues = this.props.form.getFieldsValue()

        const extrairId = valor => {
            if (typeof valor === 'object' && valor.key) {
                return valor.key
            }
            return valor
        }

        axios.put(`/generos/${this.state.id}`, {
            nome: formValues.nomeGenero,
            familia_id: extrairId(formValues.nomeFamilia)
        })
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 204) {
                    this.requisitaListaGenero()
                    this.openNotificationWithIcon('success', this.props.t('common:sucesso'), this.props.t('common:atualizacaoRealizadaSucesso'))
                } else if (response.status === 400) {
                    this.openNotificationWithIcon('warning', this.props.t('common:falha'), response.data.error.message)
                } else {
                    this.openNotificationWithIcon('error', this.props.t('common:falha'), this.props.t('listaTaxonomiaGenero:erroAtualizacaoGenero'))
                }
                this.props.form.setFields({
                    nomeGenero: {
                        value: ''
                    }
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

    requisitaFamilias = async (searchText = '', reinoId = null) => {
        this.setState({ fetchingFamilias: true })

        try {
            const params = {
                limite: 9999999,
                ...(searchText ? { familia: searchText } : {}),
                ...(reinoId ? { reino_id: reinoId } : {})
            }

            const isLogged = Boolean(localStorage.getItem('token'))

            if (!isLogged && window.grecaptcha && window.grecaptcha.ready) {
                await new Promise(resolve => window.grecaptcha.ready(resolve))
                const token = await window.grecaptcha.execute(recaptchaKey, { action: 'familias' })
                params.recaptchaToken = token
            }

            const response = await axios.get('/familias', { params })

            if (response.status === 200) {
                this.setState({
                    familias: response.data.resultado,
                    fetchingFamilias: false
                })
                return response.data.resultado
            }
        } catch (err) {
            this.setState({ fetchingFamilias: false })
            const { response } = err
            if (response && response.data) {
                const { error } = response.data
                console.error(error.message)
            }
            this.notificacao('error', this.props.t('common:erro'), this.props.t('listaTaxonomiaGenero:falhaBuscarFamilias'))
        }
        return []
    }

    renderPainelBusca(getFieldDecorator) {
        return (
            <Card title="Buscar gênero">
                <Form onSubmit={this.onSubmit}>
                    <Row gutter={8}>
                        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <span>{this.props.t('listaTaxonomiaGenero:nomeGenero')}</span>
                            </Col>
                            <Col span={24}>
                                <FormItem>
                                    {getFieldDecorator('genero')(
                                        <Input placeholder="Passion Flower" type="text" />
                                    )}
                                </FormItem>
                            </Col>
                        </Col>

                        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <span>{this.props.t('listaTaxonomiaGenero:nomeFamilia')}</span>
                            </Col>
                            <Col span={24}>
                                <FormItem>
                                    {getFieldDecorator('familia')(
                                        <Input placeholder="Fabaceae" type="text" />
                                    )}
                                </FormItem>
                            </Col>
                        </Col>
                    </Row>

                    <Row style={{ marginTop: 32 }}>
                        <Col span={24}>
                            <Row align="middle" type="flex" justify="end" gutter={16}>
                                <Col xs={24} sm={8} md={12} lg={16} xl={16}>
                                    <TotalRecordFound
                                        total={this.state.metadados?.total}
                                    />
                                </Col>
                                <Col xs={24} sm={8} md={6} lg={4} xl={4}>
                                    <FormItem>
                                        <Button
                                            onClick={() => {
                                                this.props.form.resetFields()
                                                this.setState({
                                                    pagina: 1,
                                                    valores: {},
                                                    metadados: {},
                                                    usuarios: []
                                                })
                                                this.requisitaListaGenero({}, 1)
                                            }}
                                            className="login-form-button"
                                        >
                                            {this.props.t('common:limpar')}
                                        </Button>
                                    </FormItem>
                                </Col>
                                <Col xs={24} sm={8} md={6} lg={4} xl={4}>
                                    <FormItem>
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            className="login-form-button ant-btn-pesquisar"
                                        >
                                            {this.props.t('common:pesquisar')}
                                        </Button>
                                    </FormItem>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Form>
            </Card>
        )
    }

    optionReino = () => this.state.reinos.map(item => (
        <Option key={item.id} value={item.id}>{item.nome}</Option>
    ))

    optionFamilia = () => this.state.familias.map(item => (
        <Option key={item.id} value={item.id}>{item.nome}</Option>
    ))

    renderFormulario() {
        const { getFieldDecorator } = this.props.form
        const { fetchingReinos, fetchingFamilias, reinoSelecionado } = this.state

        const columns = [
            {
                title: this.props.t('listaTaxonomiaGenero:colunaGenero'),
                type: 'text',
                key: 'genero',
                dataIndex: 'genero',
                sorter: true,
                width: '30.4%'
            },
            {
                title: this.props.t('listaTaxonomiaGenero:colunaFamilia'),
                type: 'text',
                key: 'familia',
                dataIndex: 'familia',
                sorter: true,
                width: '30.4%'
            },
            {
                title: this.props.t('listaTaxonomiaGenero:colunaAcao'),
                key: 'acao',
                width: 100
            }
        ]

        return (
            <div>
                <Form onSubmit={this.handleSubmitForm}>
                    <ModalCadastroComponent
                        title={this.state.titulo}
                        visibleModal={this.state.visibleModal}
                        loadingModal={this.state.loadingModal}
                        onCancel={
                            () => {
                                this.props.form.resetFields()
                                this.setState({
                                    visibleModal: false,
                                    reinoSelecionado: null,
                                    familias: []
                                })
                            }
                        }
                        onOk={() => {
                            if (this.state.id === -1) {
                                if (this.props.form.getFieldsValue().nomeFamilia && this.props.form.getFieldsValue().nomeGenero && this.props.form.getFieldsValue().nomeGenero.trim() !== '') {
                                    this.cadastraNovaGenero()
                                } else {
                                    this.openNotificationWithIcon('warning', this.props.t('common:falha'), this.props.t('listaTaxonomiaGenero:validacaoNomeGeneroFamilia'))
                                }
                            } else if (this.props.form.getFieldsValue().nomeFamilia && this.props.form.getFieldsValue().nomeGenero && this.props.form.getFieldsValue().nomeGenero.trim() !== '') {
                                this.atualizaGenero()
                            } else {
                                this.openNotificationWithIcon('warning', this.props.t('common:falha'), this.props.t('listaTaxonomiaGenero:validacaoNomeGeneroFamilia'))
                            }

                            this.props.form.resetFields()
                            this.setState({
                                visibleModal: false,
                                reinoSelecionado: null,
                                familias: []
                            })
                        }}
                    >

                        <div>
                            <Row gutter={8}>
                                <SelectedFormField
                                    title={this.props.t('listaTaxonomiaGenero:nomeReino')}
                                    placeholder={this.props.t('listaTaxonomiaGenero:placeholderSelecionarReino')}
                                    fieldName="nomeReino"
                                    getFieldDecorator={getFieldDecorator}
                                    onSearch={searchText => {
                                        this.requisitaReinos(searchText || '')
                                    }}
                                    onChange={value => {
                                        this.setState({
                                            reinoSelecionado: value,
                                            familias: []
                                        })
                                        this.props.form.setFieldsValue({ nomeFamilia: undefined })
                                        if (value) {
                                            this.requisitaFamilias('', value)
                                        }
                                    }}
                                    others={{
                                        loading: fetchingReinos,
                                        notFoundContent: fetchingReinos ? <Spin size="small" /> : this.props.t('common:nenhumResultadoEncontrado'),
                                        allowClear: true
                                    }}
                                    debounceDelay={200}
                                    xs={24}
                                    sm={24}
                                    md={24}
                                    lg={24}
                                    xl={24}
                                >
                                    {this.optionReino()}
                                </SelectedFormField>
                            </Row>
                            <Row gutter={8} style={{ marginTop: 16 }}>
                                <SelectedFormField
                                    title={this.props.t('listaTaxonomiaGenero:nomeFamilia')}
                                    placeholder={reinoSelecionado ? this.props.t('listaTaxonomiaGenero:placeholderSelecionarFamilia') : this.props.t('listaTaxonomiaGenero:placeholderSelecionarReinoPrimeiro')}
                                    fieldName="nomeFamilia"
                                    getFieldDecorator={getFieldDecorator}
                                    onSearch={searchText => {
                                        if (reinoSelecionado) {
                                            this.requisitaFamilias(searchText || '', reinoSelecionado)
                                        }
                                    }}
                                    others={{
                                        loading: fetchingFamilias,
                                        notFoundContent: fetchingFamilias ? <Spin size="small" /> : this.props.t('common:nenhumResultadoEncontrado'),
                                        allowClear: true
                                    }}
                                    disabled={!reinoSelecionado}
                                    debounceDelay={200}
                                    xs={24}
                                    sm={24}
                                    md={24}
                                    lg={24}
                                    xl={24}
                                >
                                    {this.optionFamilia()}
                                </SelectedFormField>
                            </Row>
                            <Row gutter={8} style={{ marginTop: 16 }}>
                                <Col span={24}>
                                    <span>{this.props.t('listaTaxonomiaGenero:nomeGenero')}</span>
                                </Col>
                            </Row>
                            <Row gutter={8}>
                                <Col span={24}>
                                    <FormItem>
                                        {getFieldDecorator('nomeGenero')(
                                            <Input placeholder="" type="text" />
                                        )}
                                    </FormItem>
                                </Col>
                            </Row>
                        </div>

                    </ModalCadastroComponent>
                </Form>

                <Row gutter={24} style={{ marginBottom: '20px' }}>
                    <Col xs={24} sm={14} md={18} lg={20} xl={20}>
                        <h2 style={{ fontWeight: 200 }}>{this.props.t('listaTaxonomiaGenero:generos')}</h2>
                    </Col>
                    <Col xs={24} sm={10} md={6} lg={4} xl={4}>
                        {this.renderAdd()}
                    </Col>
                </Row>

                <Divider dashed />
                {this.renderPainelBusca(getFieldDecorator)}
                <Divider dashed />
                <SimpleTableComponent
                    columns={isCuradorOuOperador() ? columns : columns.filter(column => column.key !== 'acao')}
                    data={this.state.generos}
                    metadados={this.state.metadados}
                    loading={this.state.loading}
                    changePage={(pg, pageSize, sorter) => {
                        this.setState({
                            pagina: pg,
                            loading: true
                        })
                        this.requisitaListaGenero(this.state.valores, pg, pageSize, sorter)
                    }}
                />
                <Divider dashed />
            </div>
        )
    }

    render() {
        return (
            this.renderFormulario()
        )
    }
}
const ListaTaxonomiaGeneroWithForm = Form.create()(ListaTaxonomiaGenero)

export default withTranslation()(ListaTaxonomiaGeneroWithForm)
