import { Component } from 'react'

import {
    Divider, Modal, Spin, Card, Row, Col,
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

class ListaTaxonomiaSubespecie extends Component {
    constructor(props) {
        super(props)
        this.state = {
            especies: [],
            metadados: {},
            subespecies: [],
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
        axios.delete(`/subespecies/${id}`)
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 204) {
                    this.requisitaListaSubespecie(this.state.valores, this.state.pagina)
                    this.notificacao('success', this.props.t('common:exlcuir'), this.props.t('listaTaxonomiaSubespecie:subespecieExcluidaSucesso'))
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
                        this.notificacao('error', this.props.t('listaTaxonomiaSubespecie:erroExcluirSubespecie'), error.code)
                    } else {
                        this.notificacao('error', this.props.t('listaTaxonomiaSubespecie:erroExcluirSubespecie'), this.props.t('listaTaxonomiaSubespecie:erroInesperadoExcluirSubespecie'))
                    }
                    console.error(error)
                } else {
                    this.notificacao('error', this.props.t('listaTaxonomiaSubespecie:erroExcluirSubespecie'), this.props.t('common:erroComunicacaoServidor'))
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
            title: this.props.t('listaTaxonomiaSubespecie:confirmarExclusaoSubespecie'),
            content: this.props.t('listaTaxonomiaSubespecie:mensagemExclusaoSubespecie'),
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
        this.requisitaListaSubespecie({}, this.state.pagina)
        this.requisitaEspecies()
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

                            this.props.form.setFieldsValue({
                                nomeSubespecie: item.nome,
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
                    {this.props.t('common:adicionar')}
                </Button>
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

    formataDadosSubespecie = subespecies => subespecies.map(item => ({
        key: item.id,
        subespecie: item.nome,
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
            this.requisitaListaSubespecie(valores, this.state.pagina)
        }
    }

    onSubmit = event => {
        event.preventDefault()
        this.props.form.validateFields(this.handleSubmit)
    }

    requisitaListaSubespecie = async (valores, pg, pageSize, sorter) => {
        this.setState({ loading: true })

        const campo = sorter && sorter.field ? sorter.field : 'subespecie'
        const ordem = sorter && sorter.order === 'descend' ? 'desc' : 'asc'

        const params = {
            pagina: pg,
            limite: pageSize || 20,
            order: `${campo}:${ordem}`,
            ...(valores && valores.subespecie ? { subespecie: valores.subespecie } : {}),
            ...(valores && valores.familia ? { familia_nome: valores.familia } : {}),
            ...(valores && valores.genero ? { genero_nome: valores.genero } : {}),
            ...(valores && valores.especie ? { especie_nome: valores.especie } : {})
        }

        const isLogged = Boolean(localStorage.getItem('token'))

        if (!isLogged && window.grecaptcha && window.grecaptcha.ready) {
            await new Promise(resolve => window.grecaptcha.ready(resolve))
            const token = await window.grecaptcha.execute(recaptchaKey, { action: 'subespecies' })
            params.recaptchaToken = token
        }

        try {
            const response = await axios.get('/subespecies', { params })

            if (response.status === 200) {
                const { data } = response
                this.setState({
                    subespecies: this.formataDadosSubespecie(data.resultado),
                    metadados: data.metadados,
                    loading: false
                })
            } else if (response.status === 400) {
                this.notificacao('warning', this.props.t('listaTaxonomiaSubespecie:buscarSubespecie'), this.props.t('listaTaxonomiaSubespecie:erroBuscarSubespecies'))
                this.setState({ loading: false })
            } else {
                this.notificacao('error', this.props.t('common:erro'), this.props.t('listaTaxonomiaSubespecie:erroServidorBuscarSubespecies'))
                this.setState({ loading: false })
            }
        } catch (err) {
            this.setState({ loading: false })
            const { response } = err
            if (response && response.data) {
                const { error } = response.data
                console.error(error.message)
            }
            this.notificacao('error', this.props.t('common:erro'), this.props.t('listaTaxonomiaSubespecie:falhaBuscarSubespecies'))
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
                this.notificacao('warning', this.props.t('listaTaxonomiaSubespecie:buscarReinos'), this.props.t('listaTaxonomiaSubespecie:erroBuscarReinos'))
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
            this.notificacao('error', this.props.t('common:erro'), this.props.t('listaTaxonomiaSubespecie:falhaBuscarReinos'))
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
            const token = await window.grecaptcha.execute(recaptchaKey, { action: 'subespecies' })
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
                this.notificacao('warning', this.props.t('listaTaxonomiaSubespecie:buscarFamilias'), this.props.t('listaTaxonomiaSubespecie:erroBuscarFamilias'))
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
            this.notificacao('error', this.props.t('common:erro'), this.props.t('listaTaxonomiaSubespecie:falhaBuscarFamilias'))
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
            const token = await window.grecaptcha.execute(recaptchaKey, { action: 'subespecies' })
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
                this.notificacao('warning', this.props.t('listaTaxonomiaSubespecie:buscarGeneros'), this.props.t('listaTaxonomiaSubespecie:erroBuscarGeneros'))
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
            this.notificacao('error', this.props.t('common:erro'), this.props.t('listaTaxonomiaSubespecie:falhaBuscarGeneros'))
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
            const token = await window.grecaptcha.execute(recaptchaKey, { action: 'subespecies' })
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
                this.notificacao('warning', this.props.t('listaTaxonomiaSubespecie:buscarEspecies'), this.props.t('listaTaxonomiaSubespecie:erroBuscarEspecies'))
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
            this.notificacao('error', this.props.t('common:erro'), this.props.t('listaTaxonomiaSubespecie:falhaBuscarEspecies'))
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
            const token = await window.grecaptcha.execute(recaptchaKey, { action: 'subespecies' })
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
                this.notificacao('warning', this.props.t('listaTaxonomiaSubespecie:buscarAutores'), this.props.t('listaTaxonomiaSubespecie:erroBuscarAutores'))
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
            this.notificacao('error', this.props.t('common:erro'), this.props.t('listaTaxonomiaSubespecie:falhaBuscarAutores'))
            return []
        }
    }

    cadastraNovaSubespecie() {
        this.setState({
            loading: true
        })
        axios.post('/subespecies', {
            nome: this.props.form.getFieldsValue().nomeSubespecie,
            especie_id: this.props.form.getFieldsValue().nomeEspecie,
            autor_id: this.props.form.getFieldsValue().nomeAutor
        })
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 204) {
                    this.requisitaListaSubespecie()
                    this.openNotificationWithIcon('success', this.props.t('common:tituloSucesso'), this.props.t('common:cadastroRealizadoSucesso'))
                } else if (response.status === 400) {
                    this.openNotificationWithIcon('warning', this.props.t('common:tituloFalha'), response.data.error.message)
                } else {
                    this.openNotificationWithIcon('error', this.props.t('common:tituloFalha'), this.props.t('listaTaxonomiaSubespecie:erroCadastrarSubespecie'))
                }
                this.props.form.setFields({
                    nomeSubespecie: {
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

    atualizaSubespecie() {
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

        axios.put(`/subespecies/${this.state.id}`, {
            nome: formValues.nomeSubespecie,
            especie_id: extrairId(formValues.nomeEspecie),
            autor_id: autorId || null
        })
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 204) {
                    this.requisitaListaSubespecie()
                    this.openNotificationWithIcon('success', this.props.t('common:tituloSucesso'), this.props.t('common:atualizacaoRealizadaSucesso'))
                } else if (response.status === 400) {
                    this.openNotificationWithIcon('warning', this.props.t('common:tituloFalha'), response.data.error.message)
                } else {
                    this.openNotificationWithIcon('error', this.props.t('common:tituloFalha'), this.props.t('listaTaxonomiaSubespecie:erroAtualizarSubespecie'))
                }
                this.props.form.setFields({
                    nomeSubespecie: {
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
            <Card title={this.props.t('listaTaxonomiaSubespecie:tituloBuscarSubespecie')}>
                <Form onSubmit={this.onSubmit}>
                    <Row gutter={8}>
                        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <span>{this.props.t('listaTaxonomiaSubespecie:nomeSubespecie')}</span>
                            </Col>
                            <Col span={24}>
                                <FormItem>
                                    {getFieldDecorator('subespecie')(
                                        <Input placeholder="A. comosus" type="text" />
                                    )}
                                </FormItem>
                            </Col>
                        </Col>

                        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <span>{this.props.t('listaTaxonomiaSubespecie:nomeFamilia')}</span>
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
                                <span>{this.props.t('listaTaxonomiaSubespecie:nomeGenero')}</span>
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
                                <span>{this.props.t('listaTaxonomiaSubespecie:nomeEspecie')}</span>
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
                                                this.requisitaListaSubespecie({}, 1)
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
                title: this.props.t('listaTaxonomiaSubespecie:colunaSubespecie'),
                type: 'text',
                key: 'subespecie',
                dataIndex: 'subespecie',
                width: '15.5%',
                sorter: true
            },
            {
                title: this.props.t('listaTaxonomiaSubespecie:colunaFamilia'),
                key: 'familia',
                dataIndex: 'familia',
                width: '15.5%',
                sorter: true
            },
            {
                title: this.props.t('listaTaxonomiaSubespecie:colunaGenero'),
                key: 'genero',
                dataIndex: 'genero',
                width: '15.5%',
                sorter: true
            },
            {
                title: this.props.t('listaTaxonomiaSubespecie:colunaEspecie'),
                key: 'especie',
                dataIndex: 'especie',
                width: '15.5%',
                sorter: true
            },
            {
                title: this.props.t('listaTaxonomiaSubespecie:colunaAutor'),
                key: 'autor',
                dataIndex: 'autor',
                width: '15.5%',
                sorter: true
            },
            {
                title: this.props.t('listaTaxonomiaSubespecie:colunaAcao'),
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
                                if (this.props.form.getFieldsValue().nomeEspecie && this.props.form.getFieldsValue().nomeSubespecie && this.props.form.getFieldsValue().nomeSubespecie.trim() !== '') {
                                    this.cadastraNovaSubespecie()
                                } else {
                                    this.openNotificationWithIcon('warning', this.props.t('common:tituloFalha'), this.props.t('listaTaxonomiaSubespecie:informarNomeSubespecieEspecie'))
                                }
                            } else if (this.props.form.getFieldsValue().nomeEspecie && this.props.form.getFieldsValue().nomeSubespecie && this.props.form.getFieldsValue().nomeSubespecie.trim() !== '') {
                                this.atualizaSubespecie()
                            } else {
                                this.openNotificationWithIcon('warning', this.props.t('common:tituloFalha'), this.props.t('listaTaxonomiaSubespecie:informarNomeSubespecieEspecie'))
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
                                    title={this.props.t('listaTaxonomiaSubespecie:cadastroNomeReino')}
                                    placeholder={this.props.t('listaTaxonomiaSubespecie:selecioneReino')}
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
                                    title={this.props.t('listaTaxonomiaSubespecie:cadastroNomeFamilia')}
                                    placeholder={reinoSelecionado ? this.props.t('listaTaxonomiaSubespecie:selecioneFamilia') : this.props.t('listaTaxonomiaSubespecie:selecioneReinoPrimeiro')}
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
                                    title={this.props.t('listaTaxonomiaSubespecie:cadastroNomeGenero')}
                                    placeholder={familiaSelecionada ? this.props.t('listaTaxonomiaSubespecie:selecioneGenero') : this.props.t('listaTaxonomiaSubespecie:selecioneFamiliaPrimeiro')}
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
                                    title={this.props.t('listaTaxonomiaSubespecie:cadastroNomeEspecie')}
                                    placeholder={generoSelecionado ? this.props.t('listaTaxonomiaSubespecie:selecione') : this.props.t('listaTaxonomiaSubespecie:selecioneGeneroPrimeiro')}
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
                                    <span>{this.props.t('listaTaxonomiaSubespecie:cadastroNomeSubespecie')}</span>
                                </Col>
                            </Row>
                            <Row gutter={8}>
                                <Col span={24}>
                                    <FormItem>
                                        {getFieldDecorator('nomeSubespecie')(
                                            <Input placeholder="" type="text" />
                                        )}
                                    </FormItem>
                                </Col>
                            </Row>
                            <Row gutter={8} style={{ marginTop: 16 }}>
                                <SelectedFormField
                                    title={this.props.t('listaTaxonomiaSubespecie:cadastroNomeAutor')}
                                    placeholder={this.props.t('listaTaxonomiaSubespecie:selecioneAutor')}
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
                        <h2 style={{ fontWeight: 200 }}>{this.props.t('listaTaxonomiaSubespecie:subespecies')}</h2>
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
                    data={this.state.subespecies}
                    metadados={this.state.metadados}
                    loading={this.state.loading}
                    changePage={(pg, pageSize, sorter) => {
                        this.setState({
                            pagina: pg,
                            loading: true
                        })
                        this.requisitaListaSubespecie(this.state.valores, pg, pageSize, sorter)
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

const ListaTaxonomiaSubespecieWithForm = Form.create()(ListaTaxonomiaSubespecie)
export default withTranslation()(ListaTaxonomiaSubespecieWithForm)
