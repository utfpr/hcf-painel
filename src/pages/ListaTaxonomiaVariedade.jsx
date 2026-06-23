import { Component } from 'react'

import {
    Divider, Modal, Card, Spin, Row, Col,
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

class ListaTaxonomiaVariedade extends Component {
    constructor(props) {
        super(props)
        this.state = {
            especies: [],
            metadados: {},
            variedades: [],
            autores: [],
            reinos: [],
            familias: [],
            generos: [],
            pagina: 1,
            visibleModal: false,
            loadingModal: false,
            loading: false,
            fetchingReinos: false,
            fetchingFamilias: false,
            fetchingGeneros: false,
            fetchingEspecies: false,
            fetchingAutores: false,
            reinoSelecionado: null,
            familiaSelecionada: null,
            generoSelecionado: null,
            titulo: 'Cadastrar',
            id: -1
        }
    }

    requisitaExclusao(id) {
        this.setState({
            loading: true
        })
        axios.delete(`/variedades/${id}`)
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 204) {
                    this.requisitaListaVariedade(this.state.valores, this.state.pagina)
                    this.notificacao('success', this.props.t('common:excluir'), this.props.t('listaTaxonomiaVariedade:variedadeExcluidaSucesso'))
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
                        this.notificacao('error', this.props.t('listaTaxonomiaVariedade:erroExcluirVariedade'), error.code)
                    } else {
                        this.notificacao('error', this.props.t('listaTaxonomiaVariedade:erroExcluirVariedade'), this.props.t('listaTaxonomiaVariedade:erroExcluirVariedadeInesperado'))
                    }
                    console.error(error)
                } else {
                    this.notificacao('error', this.props.t('listaTaxonomiaVariedade:erroExcluirVariedade'), this.props.t('common:erroComunicacaoServidor'))
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
            title: this.props.t('listaTaxonomiaVariedade:perguntaExcluirVariedade'),
            content: this.props.t('listaTaxonomiaVariedade:confirmacaoExcluirVariedade'),
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
        this.requisitaListaVariedade({}, this.state.pagina)
        this.requisitaReinos()
        this.requisitaAutores()
    }

    gerarAcao(item) {
        if (isCuradorOuOperador()) {
            return (
                <span>
                    <Divider type="vertical" />
                    <a
                        href="#"
                        onClick={async () => {
                            const reinoId = item.especie?.genero?.familia?.reino?.id || null
                            const familiaId = item.especie?.genero?.familia?.id || null
                            const generoId = item.especie?.genero?.id || null

                            this.setState({
                                visibleModal: true,
                                id: item.id,
                                titulo: this.props.t('common:atualizar'),
                                reinoSelecionado: reinoId,
                                familiaSelecionada: familiaId,
                                generoSelecionado: generoId
                            })

                            await this.requisitaReinos()

                            if (reinoId) {
                                await this.requisitaFamilias('', reinoId)
                            }

                            if (familiaId) {
                                await this.requisitaGeneros('', familiaId)
                            }

                            if (generoId) {
                                await this.requisitaEspecies('', generoId)
                            }

                            await this.requisitaAutores()

                            this.props.form.setFieldsValue({
                                nomeVariedade: item.nome,
                                nomeEspecie: item.especie?.id,
                                nomeGenero: generoId,
                                nomeFamilia: familiaId,
                                nomeReino: reinoId,
                                nomeAutor: item.autor?.id
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

    formataDadosVariedade = variedades => variedades.map(item => ({
        key: item.id,
        variedade: item.nome,
        acao: this.gerarAcao(item),
        familia: item.especie?.genero?.familia?.nome,
        genero: item.especie?.genero?.nome,
        especie: item.especie?.nome,
        autor: item.autor?.nome
    }))

    handleSubmit = (err, valores) => {
        if (!err) {
            this.setState({
                valores,
                loading: true
            })
            this.requisitaListaVariedade(valores, this.state.pagina)
        }
    }

    onSubmit = event => {
        event.preventDefault()
        this.props.form.validateFields(this.handleSubmit)
    }

    requisitaListaVariedade = async (valores, pg, pageSize, sorter) => {
        this.setState({ loading: true })

        const campo = sorter && sorter.field ? sorter.field : 'variedade'
        const ordem = sorter && sorter.order === 'descend' ? 'desc' : 'asc'

        const params = {
            pagina: pg,
            limite: pageSize || 20,
            order: `${campo}:${ordem}`,
            ...(valores && valores.variedade ? { variedade: valores.variedade } : {}),
            ...(valores && valores.familia ? { familia_nome: valores.familia } : {}),
            ...(valores && valores.genero ? { genero_nome: valores.genero } : {}),
            ...(valores && valores.especie ? { especie_nome: valores.especie } : {})
        }

        const isLogged = Boolean(localStorage.getItem('token'))

        if (!isLogged && window.grecaptcha && window.grecaptcha.ready) {
            await new Promise(resolve => window.grecaptcha.ready(resolve))
            const token = await window.grecaptcha.execute(recaptchaKey, { action: 'generos' })
            params.recaptchaToken = token
        }

        try {
            const response = await axios.get('/variedades', { params })

            if (response.status === 200) {
                const { data } = response
                this.setState({
                    variedades: this.formataDadosVariedade(data.resultado),
                    metadados: data.metadados,
                    loading: false
                })
            } else if (response.status === 400) {
                this.notificacao('warning', this.props.t('listaTaxonomiaVariedade:buscarVariedade'), this.props.t('listaTaxonomiaVariedade:buscarVariedadeErro'))
                this.setState({ loading: false })
            } else {
                this.notificacao('error', this.props.t('common:erro'), this.props.t('listaTaxonomiaVariedade:erroServidorBuscarVariedades'))
                this.setState({ loading: false })
            }
        } catch (err) {
            this.setState({ loading: false })
            const { response } = err
            if (response && response.data) {
                const { error } = response.data
                console.error(error.message)
            }
            this.notificacao('error', this.props.t('common:erro'), this.props.t('listaTaxonomiaVariedade:erroBuscarVariedades'))
        }
    }

    requisitaReinos = async (searchText = '') => {
        this.setState({ fetchingReinos: true })

        const params = {
            limite: 9999999,
            ...(searchText ? { reino: searchText } : {})
        }

        const isLogged = Boolean(localStorage.getItem('token'))

        if (!isLogged && window.grecaptcha && window.grecaptcha.ready) {
            await new Promise(resolve => window.grecaptcha.ready(resolve))
            const token = await window.grecaptcha.execute(recaptchaKey, { action: 'generos' })
            params.recaptchaToken = token
        }

        try {
            const response = await axios.get('/reinos', { params })

            if (response.status === 200) {
                this.setState({
                    reinos: response.data.resultado,
                    fetchingReinos: false
                })
                return response.data.resultado
            } else {
                this.notificacao('warning', this.props.t('listaTaxonomiaVariedade:buscarReinos'), this.props.t('listaTaxonomiaVariedade:erroBuscarReinos'))
                this.setState({ fetchingReinos: false })
                return []
            }
        } catch (err) {
            this.setState({ fetchingReinos: false })
            const { response } = err
            if (response && response.data) {
                const { error } = response.data
                console.error(error.message)
            }
            this.notificacao('error', this.props.t('common:erro'), this.props.t('listaTaxonomiaVariedade:erroFalhaBuscarReinos'))
            return []
        }
    }

    requisitaFamilias = async (searchText = '', reinoId = null) => {
        this.setState({ fetchingFamilias: true })

        const params = {
            limite: 9999999,
            ...(searchText ? { familia: searchText } : {}),
            ...(reinoId ? { reino_id: reinoId } : {})
        }

        const isLogged = Boolean(localStorage.getItem('token'))

        if (!isLogged && window.grecaptcha && window.grecaptcha.ready) {
            await new Promise(resolve => window.grecaptcha.ready(resolve))
            const token = await window.grecaptcha.execute(recaptchaKey, { action: 'generos' })
            params.recaptchaToken = token
        }

        try {
            const response = await axios.get('/familias', { params })

            if (response.status === 200) {
                this.setState({
                    familias: response.data.resultado,
                    fetchingFamilias: false
                })
                return response.data.resultado
            } else {
                this.notificacao('warning', this.props.t('listaTaxonomiaVariedade:buscarFamilias'), this.props.t('listaTaxonomiaVariedade:erroBuscarFamilias'))
                this.setState({ fetchingFamilias: false })
                return []
            }
        } catch (err) {
            this.setState({ fetchingFamilias: false })
            const { response } = err
            if (response && response.data) {
                const { error } = response.data
                console.error(error.message)
            }
            this.notificacao('error', this.props.t('common:erro'), this.props.t('listaTaxonomiaVariedade:erroFalhaBuscarFamilias'))
            return []
        }
    }

    requisitaGeneros = async (searchText = '', familiaId = null) => {
        this.setState({ fetchingGeneros: true })

        const params = {
            limite: 9999999,
            ...(searchText ? { genero: searchText } : {}),
            ...(familiaId ? { familia_id: familiaId } : {})
        }

        const isLogged = Boolean(localStorage.getItem('token'))

        if (!isLogged && window.grecaptcha && window.grecaptcha.ready) {
            await new Promise(resolve => window.grecaptcha.ready(resolve))
            const token = await window.grecaptcha.execute(recaptchaKey, { action: 'generos' })
            params.recaptchaToken = token
        }

        try {
            const response = await axios.get('/generos', { params })

            if (response.status === 200) {
                this.setState({
                    generos: response.data.resultado,
                    fetchingGeneros: false
                })
                return response.data.resultado
            } else {
                this.notificacao('warning', this.props.t('listaTaxonomiaVariedade:buscarGeneros'), this.props.t('listaTaxonomiaVariedade:erroBuscarGeneros'))
                this.setState({ fetchingGeneros: false })
                return []
            }
        } catch (err) {
            this.setState({ fetchingGeneros: false })
            const { response } = err
            if (response && response.data) {
                const { error } = response.data
                console.error(error.message)
            }
            this.notificacao('error', this.props.t('common:erro'), this.props.t('listaTaxonomiaVariedade:erroFalhaBuscarGeneros'))
            return []
        }
    }

    requisitaEspecies = async (searchText = '', generoId = null) => {
        this.setState({ fetchingEspecies: true })

        const params = {
            limite: 9999999,
            ...(searchText ? { especie: searchText } : {}),
            ...(generoId ? { genero_id: generoId } : {})
        }

        const isLogged = Boolean(localStorage.getItem('token'))

        if (!isLogged && window.grecaptcha && window.grecaptcha.ready) {
            await new Promise(resolve => window.grecaptcha.ready(resolve))
            const token = await window.grecaptcha.execute(recaptchaKey, { action: 'generos' })
            params.recaptchaToken = token
        }

        try {
            const response = await axios.get('/especies', { params })

            if (response.status === 200) {
                this.setState({
                    especies: response.data.resultado,
                    fetchingEspecies: false
                })
                return response.data.resultado
            } else {
                this.notificacao('warning', this.props.t('listaTaxonomiaVariedade:buscarEspecies'), this.props.t('listaTaxonomiaVariedade:erroBuscarEspecies'))
                this.setState({ fetchingEspecies: false })
                return []
            }
        } catch (err) {
            this.setState({ fetchingEspecies: false })
            const { response } = err
            if (response && response.data) {
                const { error } = response.data
                console.error(error.message)
            }
            this.notificacao('error', this.props.t('common:erro'), this.props.t('listaTaxonomiaVariedade:erroFalhaBuscarEspecies'))
            return []
        }
    }

    requisitaAutores = async (searchText = '') => {
        this.setState({ fetchingAutores: true })

        const params = {
            limite: 9999999,
            ...(searchText ? { autor: searchText } : {})
        }

        const isLogged = Boolean(localStorage.getItem('token'))

        if (!isLogged && window.grecaptcha && window.grecaptcha.ready) {
            await new Promise(resolve => window.grecaptcha.ready(resolve))
            const token = await window.grecaptcha.execute(recaptchaKey, { action: 'generos' })
            params.recaptchaToken = token
        }

        try {
            const response = await axios.get('/autores', { params })

            if (response.status === 200) {
                this.setState({
                    autores: response.data.resultado,
                    fetchingAutores: false
                })
                return response.data.resultado
            } else {
                this.notificacao('warning', this.props.t('listaTaxonomiaVariedade:buscarAutores'), this.props.t('listaTaxonomiaVariedade:erroBuscarAutores'))
                this.setState({ fetchingAutores: false })
                return []
            }
        } catch (err) {
            this.setState({ fetchingAutores: false })
            const { response } = err
            if (response && response.data) {
                const { error } = response.data
                console.error(error.message)
            }
            this.notificacao('error', this.props.t('common:erro'), this.props.t('listaTaxonomiaVariedade:erroFalhaBuscarAutores'))
            return []
        }
    }

    renderAdd = () => {
        if (isCuradorOuOperador()) {
            return (
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={async () => {
                        this.props.form.resetFields()

                        await this.requisitaReinos()

                        this.setState({
                            visibleModal: true,
                            titulo: this.props.t('common:cadastrar'),
                            id: -1,
                            reinoSelecionado: null,
                            familiaSelecionada: null,
                            generoSelecionado: null,
                            familias: [],
                            generos: [],
                            especies: []
                        })
                    }}
                    style={{ backgroundColor: '#5CB85C', borderColor: '#5CB85C', width: '100%' }}
                >
                    Adicionar
                </Button>
            )
        }
        return undefined
    }

    cadastraNovaVariedade() {
        this.setState({
            loading: true
        })
        axios.post('/variedades', {
            nome: this.props.form.getFieldsValue().nomeVariedade,
            especie_id: this.props.form.getFieldsValue().nomeEspecie,
            autor_id: this.props.form.getFieldsValue().nomeAutor
        })
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 204) {
                    this.requisitaListaVariedade()
                    this.openNotificationWithIcon('success', this.props.t('common:tituloSucesso'), this.props.t('common:cadastroRealizadoSucesso'))
                } else if (response.status === 400) {
                    this.openNotificationWithIcon('warning', this.props.t('common:tituloFalha'), response.data.error.message)
                } else {
                    this.openNotificationWithIcon('error', this.props.t('common:tituloFalha'), this.props.t('litsaTaxonomiaVariedade:erroCadastroVariedade'))
                }
                this.props.form.setFields({
                    nomeVariedade: {
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
                    throw new Error(error.message)
                } else {
                    throw err
                }
            })
            .catch(this.catchRequestError)
    }

    atualizaVariedade() {
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

        const autorId = extrairId(formValues.nomeAutor)

        axios.put(`/variedades/${this.state.id}`, {
            nome: formValues.nomeVariedade,
            especie_id: extrairId(formValues.nomeEspecie),
            autor_id: autorId || null
        })
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 204) {
                    this.requisitaListaVariedade()
                    this.openNotificationWithIcon('success', this.props.t('common:tituloSucesso'), this.props.t('common:atualizacaoRealizadaSucesso'))
                } else if (response.status === 400) {
                    this.openNotificationWithIcon('warning', this.props.t('common:tituloFalha'), response.data.error.message)
                } else {
                    this.openNotificationWithIcon('error', this.props.t('common:tituloFalha'), this.props.t('listaTaxonomiaVariedade:erroAtualizarVariedade'))
                }
                this.props.form.setFields({
                    nomeVariedade: {
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
                    throw new Error(error.message)
                } else {
                    throw err
                }
            })
            .catch(this.catchRequestError)
    }

    renderPainelBusca(getFieldDecorator) {
        return (
            <Card title={this.props.t('listaTaxonomiaVariedade:buscarVariedade')}>
                <Form onSubmit={this.onSubmit}>
                    <Row gutter={8}>
                        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <span>{this.props.t('listaTaxonomiaVariedade:nomeVariedade')}</span>
                            </Col>
                            <Col span={24}>
                                <FormItem>
                                    {getFieldDecorator('variedade')(
                                        <Input placeholder="A. comosus" type="text" />
                                    )}
                                </FormItem>
                            </Col>
                        </Col>

                        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <span>{this.props.t('listaTaxonomiaVariedade:nomeFamilia')}</span>
                            </Col>
                            <Col span={24}>
                                <FormItem>
                                    {getFieldDecorator('familia')(
                                        <Input placeholder="Fabaceae" type="text" />
                                    )}
                                </FormItem>
                            </Col>
                        </Col>

                        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <span>{this.props.t('listaTaxonomiaVariedade:nomeGenero')}</span>
                            </Col>
                            <Col span={24}>
                                <FormItem>
                                    {getFieldDecorator('genero')(
                                        <Input placeholder="Chamaecrista" type="text" />
                                    )}
                                </FormItem>
                            </Col>
                        </Col>

                        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <span>{this.props.t('listaTaxonomiaVariedade:nomeEspecie')}</span>
                            </Col>
                            <Col span={24}>
                                <FormItem>
                                    {getFieldDecorator('especie')(
                                        <Input placeholder="guianensis" type="text" />
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
                                                    metadados: {}
                                                })
                                                this.requisitaListaVariedade({}, 1)
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

    optionGenero = () => this.state.generos.map(item => (
        <Option key={item.id} value={item.id}>{item.nome}</Option>
    ))

    optionEspecie = () => this.state.especies.map(item => (
        <Option key={item.id} value={item.id}>{item.nome}</Option>
    ))

    optionAutores = () => this.state.autores.map(item => (
        <Option key={item.id} value={item.id}>{item.nome}</Option>
    ))

    renderFormulario() {
        const { getFieldDecorator } = this.props.form
        const {
            fetchingReinos,
            fetchingFamilias,
            fetchingGeneros,
            fetchingEspecies,
            fetchingAutores,
            reinoSelecionado,
            familiaSelecionada,
            generoSelecionado
        } = this.state

        const columns = [
            {
                title: this.props.t('listaTaxonomiaVariedade:colunaVariedade'),
                type: 'text',
                key: 'variedade',
                dataIndex: 'variedade',
                width: '15.5%',
                sorter: true
            },
            {
                title: this.props.t('listaTaxonomiaVariedade:colunaFamilia'),
                key: 'familia',
                dataIndex: 'familia',
                width: '15.5%',
                sorter: true
            },
            {
                title: this.props.t('listaTaxonomiaVariedade:colunaGenero'),
                key: 'genero',
                dataIndex: 'genero',
                width: '15.5%',
                sorter: true
            },
            {
                title: this.props.t('listaTaxonomiaVariedade:colunaEspecie'),
                key: 'especie',
                dataIndex: 'especie',
                width: '15.5%',
                sorter: true
            },
            {
                title: this.props.t('listaTaxonomiaVariedade:colunaAutor'),
                key: 'autor',
                dataIndex: 'autor',
                width: '15.5%',
                sorter: true
            },
            {
                title: this.props.t('listaTaxonomiaVariedade:colunaAcao'),
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
                                    familiaSelecionada: null,
                                    generoSelecionado: null,
                                    familias: [],
                                    generos: [],
                                    especies: []
                                })
                            }
                        }
                        onOk={() => {
                            if (this.state.id === -1) {
                                if (this.props.form.getFieldsValue().nomeEspecie && this.props.form.getFieldsValue().nomeVariedade && this.props.form.getFieldsValue().nomeVariedade.trim() !== '') {
                                    this.cadastraNovaVariedade()
                                } else {
                                    this.openNotificationWithIcon('warning', this.props.t('common:tituloFalha'), this.props.t('listaTaxonomiaVariedade:informarVariedadeEspecie'))
                                }
                            } else if (this.props.form.getFieldsValue().nomeEspecie && this.props.form.getFieldsValue().nomeVariedade && this.props.form.getFieldsValue().nomeVariedade.trim() !== '') {
                                this.atualizaVariedade()
                            } else {
                                this.openNotificationWithIcon('warning', this.props.t('common:tituloFalha'), this.props.t('listaTaxonomiaVariedade:informarVariedadeEspecie'))
                            }

                            this.props.form.resetFields()
                            this.setState({
                                visibleModal: false,
                                reinoSelecionado: null,
                                familiaSelecionada: null,
                                generoSelecionado: null,
                                familias: [],
                                generos: [],
                                especies: []
                            })
                        }}
                    >

                        <div>
                            <Row gutter={8}>
                                <SelectedFormField
                                    title={this.props.t('listaTaxonomiaVariedade:cadastroNomeReino')}
                                    placeholder={this.props.t('listaTaxonomiaVariedade:selecioneReino')}
                                    fieldName="nomeReino"
                                    getFieldDecorator={getFieldDecorator}
                                    onSearch={searchText => {
                                        this.requisitaReinos(searchText || '')
                                    }}
                                    onChange={value => {
                                        this.setState({
                                            reinoSelecionado: value,
                                            familiaSelecionada: null,
                                            generoSelecionado: null,
                                            familias: [],
                                            generos: [],
                                            especies: []
                                        })
                                        this.props.form.setFieldsValue({
                                            nomeFamilia: undefined,
                                            nomeGenero: undefined,
                                            nomeEspecie: undefined
                                        })
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
                                    title={this.props.t('listaTaxonomiaVariedade:cadastroNomeFamilia')}
                                    placeholder={reinoSelecionado ? this.props.t('listaTaxonomiaVariedade:selecioneFamilia') : this.props.t('listaTaxonomiaVariedade:selecioneReinoPrimeiro')}
                                    fieldName="nomeFamilia"
                                    getFieldDecorator={getFieldDecorator}
                                    onSearch={searchText => {
                                        if (reinoSelecionado) {
                                            this.requisitaFamilias(searchText || '', reinoSelecionado)
                                        }
                                    }}
                                    onChange={value => {
                                        this.setState({
                                            familiaSelecionada: value,
                                            generoSelecionado: null,
                                            generos: [],
                                            especies: []
                                        })
                                        this.props.form.setFieldsValue({
                                            nomeGenero: undefined,
                                            nomeEspecie: undefined
                                        })
                                        if (value) {
                                            this.requisitaGeneros('', value)
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
                                <SelectedFormField
                                    title={this.props.t('listaTaxonomiaVariedade:cadastroNomeGenero')}
                                    placeholder={familiaSelecionada ? this.props.t('listaTaxonomiaVariedade:selecioneGenero') : this.props.t('listaTaxonomiaVariedade:selecioneFamiliaPrimeiro')}
                                    fieldName="nomeGenero"
                                    getFieldDecorator={getFieldDecorator}
                                    onSearch={searchText => {
                                        if (familiaSelecionada) {
                                            this.requisitaGeneros(searchText || '', familiaSelecionada)
                                        }
                                    }}
                                    onChange={value => {
                                        this.setState({
                                            generoSelecionado: value,
                                            especies: []
                                        })
                                        this.props.form.setFieldsValue({ nomeEspecie: undefined })
                                        if (value) {
                                            this.requisitaEspecies('', value)
                                        }
                                    }}
                                    others={{
                                        loading: fetchingGeneros,
                                        notFoundContent: fetchingGeneros ? <Spin size="small" /> : this.props.t('common:nenhumResultadoEncontrado'),
                                        allowClear: true
                                    }}
                                    disabled={!familiaSelecionada}
                                    debounceDelay={200}
                                    xs={24}
                                    sm={24}
                                    md={24}
                                    lg={24}
                                    xl={24}
                                >
                                    {this.optionGenero()}
                                </SelectedFormField>
                            </Row>
                            <Row gutter={8} style={{ marginTop: 16 }}>
                                <SelectedFormField
                                    title={this.props.t('listaTaxonomiaVariedade:cadastroNomeEspecie')}
                                    placeholder={generoSelecionado ? this.props.t('listaTaxonomiaVariedade:selecioneEspecie') : this.props.t('listaTaxonomiaVariedade:selecioneGeneroPrimeiro')}
                                    fieldName="nomeEspecie"
                                    getFieldDecorator={getFieldDecorator}
                                    onSearch={searchText => {
                                        if (generoSelecionado) {
                                            this.requisitaEspecies(searchText || '', generoSelecionado)
                                        }
                                    }}
                                    others={{
                                        loading: fetchingEspecies,
                                        notFoundContent: fetchingEspecies ? <Spin size="small" /> : this.props.t('common:nenhumResultadoEncontrado'),
                                        allowClear: true
                                    }}
                                    disabled={!generoSelecionado}
                                    debounceDelay={200}
                                    xs={24}
                                    sm={24}
                                    md={24}
                                    lg={24}
                                    xl={24}
                                >
                                    {this.optionEspecie()}
                                </SelectedFormField>
                            </Row>
                            <Row gutter={8} style={{ marginTop: 16 }}>
                                <Col span={24}>
                                    <span>{this.props.t('listaTaxonomiaVariedade:nomeVariedade')}</span>
                                </Col>
                            </Row>
                            <Row gutter={8}>
                                <Col span={24}>
                                    <FormItem>
                                        {getFieldDecorator('nomeVariedade')(
                                            <Input placeholder="" type="text" />
                                        )}
                                    </FormItem>
                                </Col>
                            </Row>
                            <Row gutter={8} style={{ marginTop: 16 }}>
                                <SelectedFormField
                                    title={this.props.t('listaTaxonomiaVariedade:cadastroNomeAutor')}
                                    placeholder={this.props.t('listaTaxonomiaVariedade:selecioneAutor')}
                                    fieldName="nomeAutor"
                                    getFieldDecorator={getFieldDecorator}
                                    onSearch={searchText => {
                                        this.requisitaAutores(searchText || '')
                                    }}
                                    others={{
                                        loading: fetchingAutores,
                                        notFoundContent: fetchingAutores ? <Spin size="small" /> : this.props.t('common:nenhumResultadoEncontrado'),
                                        allowClear: true
                                    }}
                                    debounceDelay={200}
                                    xs={24}
                                    sm={24}
                                    md={24}
                                    lg={24}
                                    xl={24}
                                >
                                    {this.optionAutores()}
                                </SelectedFormField>
                            </Row>
                        </div>

                    </ModalCadastroComponent>
                </Form>

                <Row gutter={24} style={{ marginBottom: '20px' }}>
                    <Col xs={24} sm={14} md={18} lg={20} xl={20}>
                        <h2 style={{ fontWeight: 200 }}>{this.props.t('listaTaxonomiaVariedade:variedades')}</h2>
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
                    data={this.state.variedades}
                    metadados={this.state.metadados}
                    loading={this.state.loading}
                    changePage={(pg, pageSize, sorter) => {
                        this.setState({
                            pagina: pg,
                            loading: true
                        })
                        this.requisitaListaVariedade(this.state.valores, pg, pageSize, sorter)
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
const ListaTaxonomiaVariedadeWithForm = Form.create()(ListaTaxonomiaVariedade)

export default withTranslation()(ListaTaxonomiaVariedadeWithForm)
