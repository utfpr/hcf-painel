import { Component } from 'react'

import {
    Divider, Modal, Spin, Card, Row, Col,
    Select, Input, Button, notification
} from 'antd'
import axios from 'axios'

import TotalRecordFound from '@/components/TotalRecordsFound'
import { Form } from '@ant-design/compatible'
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'

import ModalCadastroComponent from '../components/ModalCadastroComponent'
import SimpleTableComponent from '../components/SimpleTableComponent'
import SelectedFormField from './tombos/components/SelectedFormFiled'
import { isCuradorOuOperador } from '../helpers/usuarios'
import { recaptchaKey } from '@/config/api'

const { confirm } = Modal
const FormItem = Form.Item
const { Option } = Select

const columns = [
    {
        title: 'Espécie',
        type: 'text',
        key: 'especie',
        dataIndex: 'especie',
        width: '18.6%',
        sorter: true
    },
    {
        title: 'Família',
        key: 'familia',
        dataIndex: 'familia',
        width: '18.6%',
        sorter: true
    },
    {
        title: 'Gênero',
        key: 'genero',
        dataIndex: 'genero',
        width: '18.6%',
        sorter: true
    },
    {
        title: 'Autor',
        key: 'autor',
        dataIndex: 'autor',
        width: '18.6%',
        sorter: true
    },
    {
        title: 'Ação',
        key: 'acao',
        width: 100
    }
]

class ListaTaxonomiaEspecie extends Component {
    constructor(props) {
        super(props)
        this.state = {
            generos: [],
            metadados: {},
            especies: [],
            autores: [],
            reinos: [],
            familias: [],
            pagina: 1,
            visibleModal: false,
            loadingModal: false,
            loading: false,
            fetchingReinos: false,
            fetchingFamilias: false,
            fetchingGeneros: false,
            fetchingAutores: false,
            reinoSelecionado: null,
            familiaSelecionada: null,
            titulo: 'Cadastrar',
            id: -1
        }
    }

    requisitaExclusao(id) {
        this.setState({
            loading: true
        })
        axios.delete(`/especies/${id}`)
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 204) {
                    this.requisitaListaEspecie(this.state.valores, this.state.pagina)
                    this.notificacao('success', 'Excluir', 'A espécie foi excluída com sucesso.')
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
                        this.notificacao('error', 'Erro ao excluir espécie', error.code)
                    } else {
                        this.notificacao('error', 'Erro ao excluir espécie', 'Ocorreu um erro inesperado ao tentar excluir a espécie.')
                    }
                    console.error(error)
                } else {
                    this.notificacao('error', 'Erro ao excluir espécie', 'Falha na comunicação com o servidor.')
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
        const self = this
        confirm({
            title: 'Você tem certeza que deseja excluir esta espécie?',
            content: 'Ao clicar em SIM, a espécie será excluída.',
            okText: 'SIM',
            okType: 'danger',
            cancelText: 'NÃO',
            onOk() {
                self.requisitaExclusao(id)
            },
            onCancel() {
            }
        })
    }

    componentDidMount() {
        this.requisitaListaEspecie({}, this.state.pagina)
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
                            const reinoId = item.genero?.familia?.reino?.id || null
                            const familiaId = item.genero?.familia?.id || null

                            this.setState({
                                visibleModal: true,
                                id: item.id,
                                titulo: 'Atualizar',
                                reinoSelecionado: reinoId,
                                familiaSelecionada: familiaId
                            })

                            await this.requisitaReinos()

                            if (reinoId) {
                                await this.requisitaFamilias('', reinoId)
                            }

                            if (familiaId) {
                                await this.requisitaGeneros('', familiaId)
                            }

                            this.props.form.setFieldsValue({
                                nomeEspecie: item.nome,
                                nomeGenero: item.genero?.id,
                                nomeFamilia: familiaId,
                                nomeReino: reinoId,
                                nomeAutor: item.autor ? { key: item.autor.id, label: item.autor.nome } : undefined
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

    formataDadosEspecie = especies => especies.map(item => ({
        key: item.id,
        especie: item.nome,
        acao: this.gerarAcao(item),
        genero: item.genero?.nome,
        familia: item.genero?.familia?.nome,
        autor: item.autor?.nome
    }))

    requisitaListaEspecie = async (valores, pg, pageSize, sorter) => {
        this.setState({ loading: true })

        try {
            const campo = sorter && sorter.field ? sorter.field : 'especie'
            const ordem = sorter && sorter.order === 'descend' ? 'desc' : 'asc'

            const params = {
                pagina: pg,
                limite: pageSize || 20,
                order: `${campo}:${ordem}`,
                ...(valores && valores.especie ? { especie: valores.especie } : {}),
                ...(valores && valores.familia ? { familia_nome: valores.familia } : {}),
                ...(valores && valores.genero ? { genero_nome: valores.genero } : {})
            }

            const isLogged = Boolean(localStorage.getItem('token'))

            if (!isLogged && window.grecaptcha && window.grecaptcha.ready) {
                await new Promise(resolve => window.grecaptcha.ready(resolve))
                const token = await window.grecaptcha.execute(recaptchaKey, { action: 'especies' })
                params.recaptchaToken = token
            }

            const response = await axios.get('/especies', { params })

            if (response.status === 200) {
                const { data } = response
                this.setState({
                    especies: this.formataDadosEspecie(data.resultado),
                    metadados: data.metadados,
                    loading: false
                })
            } else if (response.status === 400) {
                this.notificacao('warning', 'Buscar espécie', 'Erro ao buscar as espécies.')
                this.setState({ loading: false })
            } else {
                this.notificacao('error', 'Error', 'Erro de servidor ao buscar as espécies.')
                this.setState({ loading: false })
            }
        } catch (err) {
            this.setState({ loading: false })
            const { response } = err
            if (response && response.data) {
                const { error } = response.data
                console.error(error.message)
            }
            this.notificacao('error', 'Erro', 'Falha ao buscar espécies.')
        }
    }

    handleSubmit = (err, valores) => {
        if (!err) {
            this.setState({
                valores,
                loading: true
            })
            this.requisitaListaEspecie(valores, this.state.pagina)
        }
    }

    onSubmit = event => {
        event.preventDefault()
        this.props.form.validateFields(this.handleSubmit)
    }

    requisitaAutores = async (searchText = '') => {
        this.setState({ fetchingAutores: true })

        try {
            const params = {
                limite: 9999999,
                ...(searchText ? { autor: searchText } : {})
            }

            const isLogged = Boolean(localStorage.getItem('token'))

            if (!isLogged && window.grecaptcha && window.grecaptcha.ready) {
                await new Promise(resolve => window.grecaptcha.ready(resolve))
                const token = await window.grecaptcha.execute(recaptchaKey, { action: 'autores' })
                params.recaptchaToken = token
            }

            const response = await axios.get('/autores', { params })

            if (response.status === 200) {
                this.setState({
                    autores: response.data.resultado,
                    fetchingAutores: false
                })
                return response.data.resultado
            } else {
                this.notificacao('warning', 'Buscar autores', 'Erro ao buscar os autores.')
                this.setState({ fetchingAutores: false })
            }
        } catch (err) {
            this.setState({ fetchingAutores: false })
            const { response } = err
            if (response && response.data) {
                const { error } = response.data
                console.error(error.message)
            }
            this.notificacao('error', 'Erro', 'Falha ao buscar autores.')
        }
        return []
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
                return response.data.resultado
            }
        } catch (err) {
            this.setState({ fetchingReinos: false })
            const { response } = err
            if (response && response.data) {
                const { error } = response.data
                console.error(error.message)
            }
            this.notificacao('error', 'Erro', 'Falha ao buscar reinos.')
        }
        return []
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
            } else {
                this.notificacao('warning', 'Buscar famílias', 'Erro ao buscar as famílias.')
                this.setState({ fetchingFamilias: false })
            }
        } catch (err) {
            this.setState({ fetchingFamilias: false })
            const { response } = err
            if (response && response.data) {
                const { error } = response.data
                console.error(error.message)
            }
            this.notificacao('error', 'Erro', 'Falha ao buscar famílias.')
        }
        return []
    }

    requisitaGeneros = async (searchText = '', familiaId = null) => {
        this.setState({ fetchingGeneros: true })

        try {
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

            const response = await axios.get('/generos', { params })

            if (response.status === 200) {
                this.setState({
                    generos: response.data.resultado,
                    fetchingGeneros: false
                })
                return response.data.resultado
            } else {
                this.notificacao('warning', 'Buscar gêneros', 'Erro ao buscar os gêneros.')
                this.setState({ fetchingGeneros: false })
            }
        } catch (err) {
            this.setState({ fetchingGeneros: false })
            const { response } = err
            if (response && response.data) {
                const { error } = response.data
                console.error(error.message)
            }
            this.notificacao('error', 'Erro', 'Falha ao buscar gêneros.')
        }
        return []
    }

    cadastraNovaEspecie() {
        this.setState({
            loading: true
        })
        axios.post('/especies', {
            nome: this.props.form.getFieldsValue().nomeEspecie,
            genero_id: this.props.form.getFieldsValue().nomeGenero,
            autor_id: this.props.form.getFieldsValue().nomeAutor
        })
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 204) {
                    this.requisitaListaEspecie()
                    this.openNotificationWithIcon('success', 'Sucesso', 'O cadastro foi realizado com sucesso.')
                } else if (response.status === 400) {
                    this.openNotificationWithIcon('warning', 'Falha', response.data.error.message)
                } else {
                    this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao cadastrar a nova espécie, tente novamente.')
                }
                this.props.form.setFields({
                    nomeEspecie: {
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

    atualizaEspecie() {
        this.setState({
            loading: true
        })

        const formValues = this.props.form.getFieldsValue()

        const extrairId = (valor) => {
            if (typeof valor === 'object' && valor.key) {
                return valor.key
            }
            return valor
        }

        const autorId = extrairId(formValues.nomeAutor)

        axios.put(`/especies/${this.state.id}`, {
            nome: formValues.nomeEspecie,
            genero_id: extrairId(formValues.nomeGenero),
            autor_id: autorId || null
        })
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 204) {
                    this.requisitaListaEspecie()
                    this.openNotificationWithIcon('success', 'Sucesso', 'A atualização foi realizada com sucesso.')
                } else if (response.status === 400) {
                    this.openNotificationWithIcon('warning', 'Falha', response.data.error.message)
                } else {
                    this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao atualizar a espécie, tente novamente.')
                }
                this.props.form.setFields({
                    nomeEspecie: {
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

    requisitaListaGenero = async (valores, pg, pageSize, sorter) => {
        this.setState({ loading: true })

        try {
            await new Promise(resolve => window.grecaptcha.ready(resolve))

            const token = await window.grecaptcha.execute(recaptchaKey, { action: 'generos' })

            const campo = sorter && sorter.field ? sorter.field : 'genero'
            const ordem = sorter && sorter.order === 'descend' ? 'desc' : 'asc'

            const params = {
                pagina: pg,
                limite: pageSize || 20,
                order: `${campo}:${ordem}`,
                recaptchaToken: token,
                ...(valores && valores.genero ? { genero: valores.genero } : {}),
                ...(valores && valores.familia ? { familia_nome: valores.familia } : {})
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
                this.notificacao('warning', 'Buscar gênero', 'Erro ao buscar os gêneros.')
                this.setState({ loading: false })
            } else {
                this.notificacao('error', 'Erro', 'Erro do servidor ao buscar os gêneros.')
                this.setState({ loading: false })
            }
        } catch (err) {
            this.setState({ loading: false })
            const { response } = err
            if (response && response.data) {
                const { error } = response.data
                console.error(error.message)
            }
            this.notificacao('error', 'Erro', 'Falha ao buscar gêneros.')
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
                            titulo: 'Cadastrar',
                            id: -1,
                            reinoSelecionado: null,
                            familiaSelecionada: null,
                            familias: [],
                            generos: []
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

    renderPainelBusca(getFieldDecorator) {
        return (
            <Card title="Buscar espécie">
                <Form onSubmit={this.onSubmit}>
                    <Row gutter={8}>
                        <Col xs={24} sm={24} md={8} lg={8} xl={8}>

                            <Col span={24}>
                                <span>Nome da espécie:</span>
                            </Col>
                            <Col span={24}>
                                <FormItem>
                                    {getFieldDecorator('especie')(
                                        <Input placeholder="A. comosus" type="text" />
                                    )}
                                </FormItem>
                            </Col>
                        </Col>

                        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <span>Nome da família:</span>
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
                                <span>Nome do gênero:</span>
                            </Col>
                            <Col span={24}>
                                <FormItem>
                                    {getFieldDecorator('genero')(
                                        <Input placeholder="Lantana" type="text" />
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
                                                this.requisitaListaEspecie({}, 1)
                                            }}
                                            className="login-form-button"
                                        >
                                            Limpar
                                        </Button>
                                    </FormItem>
                                </Col>
                                <Col xs={24} sm={8} md={6} lg={4} xl={4}>
                                    <FormItem>
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            className="login-form-button"
                                        >
                                            Pesquisar
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
        <Option value={item.id}>{item.nome}</Option>
    ))

    optionFamilia = () => this.state.familias.map(item => (
        <Option value={item.id}>{item.nome}</Option>
    ))

    optionGenero = () => this.state.generos.map(item => (
        <Option key={item.id} value={item.id}>{item.nome}</Option>
    ))

    optionAutores = () => this.state.autores.map(item => (
        <Option key={item.id} value={item.id}>{item.nome}</Option>
    ))

    renderFormulario() {
        const { getFieldDecorator } = this.props.form
        const { fetchingReinos, fetchingFamilias, fetchingGeneros, fetchingAutores, reinoSelecionado, familiaSelecionada } = this.state

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
                                    familias: [],
                                    generos: []
                                })
                            }
                        }
                        onOk={() => {
                            if (this.state.id === -1) {
                                if (this.props.form.getFieldsValue().nomeGenero && this.props.form.getFieldsValue().nomeEspecie && this.props.form.getFieldsValue().nomeEspecie.trim() !== '') {
                                    this.cadastraNovaEspecie()
                                } else {
                                    this.openNotificationWithIcon('warning', 'Falha', 'Informe o nome da nova espécie e do gênero.')
                                }
                            } else if (this.props.form.getFieldsValue().nomeGenero && this.props.form.getFieldsValue().nomeEspecie && this.props.form.getFieldsValue().nomeEspecie.trim() !== '') {
                                this.atualizaEspecie()
                            } else {
                                this.openNotificationWithIcon('warning', 'Falha', 'Informe o nome da nova espécie e do gênero.')
                            }

                            this.props.form.resetFields()
                            this.setState({
                                visibleModal: false,
                                reinoSelecionado: null,
                                familiaSelecionada: null,
                                familias: [],
                                generos: []
                            })
                        }}
                    >

                        <div>
                            <Row gutter={8}>
                                <SelectedFormField
                                    title="Nome do reino:"
                                    placeholder="Selecione um reino"
                                    fieldName="nomeReino"
                                    getFieldDecorator={getFieldDecorator}
                                    onSearch={searchText => {
                                        this.requisitaReinos(searchText || '')
                                    }}
                                    onChange={value => {
                                        this.setState({
                                            reinoSelecionado: value,
                                            familiaSelecionada: null,
                                            familias: [],
                                            generos: []
                                        })
                                        this.props.form.setFieldsValue({
                                            nomeFamilia: undefined,
                                            nomeGenero: undefined
                                        })
                                        if (value) {
                                            this.requisitaFamilias('', value)
                                        }
                                    }}
                                    others={{
                                        loading: fetchingReinos,
                                        notFoundContent: fetchingReinos ? <Spin size="small" /> : 'Nenhum resultado encontrado',
                                        allowClear: true
                                    }}
                                    debounceDelay={600}
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
                                    title="Nome da família:"
                                    placeholder={reinoSelecionado ? "Selecione uma família" : "Selecione um reino primeiro"}
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
                                            generos: []
                                        })
                                        this.props.form.setFieldsValue({ nomeGenero: undefined })
                                        if (value) {
                                            this.requisitaGeneros('', value)
                                        }
                                    }}
                                    others={{
                                        loading: fetchingFamilias,
                                        notFoundContent: fetchingFamilias ? <Spin size="small" /> : 'Nenhum resultado encontrado',
                                        allowClear: true
                                    }}
                                    disabled={!reinoSelecionado}
                                    debounceDelay={600}
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
                                    title="Nome do gênero:"
                                    placeholder={familiaSelecionada ? "Selecione um gênero" : "Selecione uma família primeiro"}
                                    fieldName="nomeGenero"
                                    getFieldDecorator={getFieldDecorator}
                                    onSearch={searchText => {
                                        if (familiaSelecionada) {
                                            this.requisitaGeneros(searchText || '', familiaSelecionada)
                                        }
                                    }}
                                    others={{
                                        loading: fetchingGeneros,
                                        notFoundContent: fetchingGeneros ? <Spin size="small" /> : 'Nenhum resultado encontrado',
                                        allowClear: true
                                    }}
                                    disabled={!familiaSelecionada}
                                    debounceDelay={600}
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
                                <Col span={24}>
                                    <span>Nome da espécie:</span>
                                </Col>
                            </Row>
                            <Row gutter={8}>
                                <Col span={24}>
                                    <FormItem>
                                        {getFieldDecorator('nomeEspecie')(
                                            <Input placeholder="" type="text" />
                                        )}
                                    </FormItem>
                                </Col>
                            </Row>
                            <Row gutter={8} style={{ marginTop: 16 }}>
                                <SelectedFormField
                                    title="Nome do autor:"
                                    placeholder="Selecione um autor"
                                    fieldName="nomeAutor"
                                    getFieldDecorator={getFieldDecorator}
                                    onSearch={searchText => {
                                        this.requisitaAutores(searchText || '')
                                    }}
                                    others={{
                                        loading: fetchingAutores,
                                        notFoundContent: fetchingAutores ? <Spin size="small" /> : 'Nenhum resultado encontrado',
                                        allowClear: true
                                    }}
                                    debounceDelay={600}
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
                        <h2 style={{ fontWeight: 200 }}>Espécies</h2>
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
                    data={this.state.especies}
                    metadados={this.state.metadados}
                    loading={this.state.loading}
                    changePage={(pg, pageSize, sorter) => {
                        this.setState({
                            pagina: pg,
                            loading: true
                        })
                        this.requisitaListaEspecie(this.state.valores, pg, pageSize, sorter)
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
export default Form.create()(ListaTaxonomiaEspecie)
