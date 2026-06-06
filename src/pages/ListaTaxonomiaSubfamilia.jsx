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

class ListaTaxonomiaSubfamilia extends Component {
    constructor(props) {
        super(props)
        this.state = {
            subfamilias: [],
            metadados: {},
            familias: [],
            reinos: [],
            pagina: 1,
            visibleModal: false,
            loadingModal: false,
            loading: false,
            fetchingFamilias: false,
            fetchingReinos: false,
            reinoSelecionado: null,
            titulo: 'Cadastrar',
            id: -1
        }
    }

    requisitaExclusao(id) {
        this.setState({
            loading: true
        })
        axios.delete(`/subfamilias/${id}`)
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 204) {
                    this.requisitaListaSubfamilia(this.state.valores, this.state.pagina)
                    this.notificacao('success', this.props.t('common:excluir'), this.props.t('listaTaxonomiaSubfamilia:sucessoExcluirSubfamilia'))
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
                        this.notificacao('error', this.props.t('listaTaxonomiaSubfamilia:erroExcluirSubfamilia'), error.code)
                    } else {
                        this.notificacao('error', this.props.t('listaTaxonomiaSubfamilia:erroExcluirSubfamilia'), this.props.t('listaTaxonomiaSubfamilia:erroExcluirSubfamiliaInesperado'))
                    }
                    console.error(error)
                } else {
                    this.notificacao('error', this.props.t('listaTaxonomiaSubfamilia:erroExcluirSubfamilia'), this.props.t('common:erroComunicacaoServidor'))
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
            title: this.props.t('listaTaxonomiaSubfamilia:confirmarExcluirSubfamilia'),
            content: this.props.t('listaTaxonomiaSubfamilia:descricaoExcluirSubfamilia'),
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
        this.requisitaListaSubfamilia({}, this.state.pagina)
        this.requisitaReinos()
    }

    gerarAcao(item) {
        if (isCuradorOuOperador()) {
            return (
                <span>
                    <Divider type="vertical" />
                    <a
                        href="#"
                        onClick={async () => {
                            const reinoId = item.familia?.reino?.id || null

                            this.setState({
                                visibleModal: true,
                                id: item.id,
                                titulo: this.props.t('common:atualizar'),
                                reinoSelecionado: reinoId
                            })

                            await this.requisitaReinos()

                            if (reinoId) {
                                await this.requisitaFamilias('', reinoId)
                            }

                            this.props.form.setFieldsValue({
                                nomeSubfamilia: item.nome,
                                nomeFamilia: item.familia?.id,
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

    formataDadosSubfamilia = subfamilias => subfamilias.map(item => ({
        key: item.id,
        subfamilia: item.nome,
        familia: item.familia?.nome,
        autor: item.autor?.nome,
        acao: this.gerarAcao(item)
    }))

    requisitaListaSubfamilia = async (valores, pg, pageSize, sorter) => {
        this.setState({ loading: true })

        const campo = sorter && sorter.field ? sorter.field : 'subfamilia'
        const ordem = sorter && sorter.order === 'descend' ? 'desc' : 'asc'

        const params = {
            pagina: pg,
            limite: pageSize || 20,
            order: `${campo}:${ordem}`,
            ...(valores && valores.subfamilia ? { subfamilia: valores.subfamilia } : {}),
            ...(valores && valores.familia ? { familia_nome: valores.familia } : {})
        }

        const isLogged = Boolean(localStorage.getItem('token'))

        if (!isLogged && window.grecaptcha && window.grecaptcha.ready) {
            await new Promise(resolve => window.grecaptcha.ready(resolve))
            const token = await window.grecaptcha.execute(recaptchaKey, { action: 'generos' })
            params.recaptchaToken = token
        }

        try {
            const response = await axios.get('/subfamilias', { params })

            if (response.status === 200) {
                const { data } = response
                this.setState({
                    subfamilias: this.formataDadosSubfamilia(data.resultado),
                    metadados: data.metadados,
                    loading: false
                })
            } else if (response.status === 400) {
                this.notificacao('warning', this.props.t('listaTaxonomiaSubfamilia:buscarSubfamiliaTipoErro'), this.props.t('listaTaxonomiaSubfamilia:buscarSubfamiliaErroMensagem'))
                this.setState({ loading: false })
            } else {
                this.notificacao('error', this.props.t('common:erro'), this.props.t('listaTaxonomiaSubfamilia:erroServidorBuscarSubfamilias'))
                this.setState({ loading: false })
            }
        } catch (err) {
            this.setState({ loading: false })
            const { response } = err
            if (response && response.data) {
                const { error } = response.data
                console.error(error.message)
            }
            this.notificacao('error', this.props.t('common:erro'), this.props.t('listaTaxonomiaSubfamilia:erroBuscarSubfamilias'))
        }
    }

    handleSubmit = (err, valores) => {
        if (!err) {
            this.setState({
                valores,
                loading: true
            })
            this.requisitaListaSubfamilia(valores, this.state.pagina)
        }
    }

    onSubmit = event => {
        event.preventDefault()
        this.props.form.validateFields(this.handleSubmit)
    }

    cadastraNovaSubfamilia() {
        this.setState({
            loading: true
        })
        axios.post('/subfamilias', {
            nome: this.props.form.getFieldsValue().nomeSubfamilia,
            familia_id: this.props.form.getFieldsValue().nomeFamilia
        })
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 204) {
                    this.requisitaListaSubfamilia()
                    this.openNotificationWithIcon('success', this.props.t('common:sucesso'), this.props.t('common:cadastroRealizadoSucesso'))
                } else if (response.status === 400) {
                    this.openNotificationWithIcon('warning', this.props.t('common:falha'), response.data.error.message)
                } else {
                    this.openNotificationWithIcon('error', this.props.t('common:falha'), this.props.t('listaTaxonomiaSubfamilia:erroCadastroSubfamilia'))
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

    atualizaSubfamilia() {
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

        axios.put(`/subfamilias/${this.state.id}`, {
            nome: formValues.nomeSubfamilia,
            familia_id: extrairId(formValues.nomeFamilia)
        })
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 204) {
                    this.requisitaListaSubfamilia()
                    this.openNotificationWithIcon('success', this.props.t('common:sucesso'), this.props.t('common:atualizacaoRealizadaSucesso'))
                } else if (response.status === 400) {
                    this.openNotificationWithIcon('warning', this.props.t('common:falha'), response.data.error.message)
                } else {
                    this.openNotificationWithIcon('error', this.props.t('common:falha'), this.props.t('listaTaxonomiaSubfamilia:erroAtualizarSubfamilia'))
                }
                this.props.form.setFields({
                    nomeSubfamilia: {
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
                            familias: []
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
            }
        } catch (err) {
            this.setState({ fetchingReinos: false })
            const { response } = err
            if (response && response.data) {
                const { error } = response.data
                console.error(error.message)
            }
            this.notificacao('error', this.props.t('common:erro'), this.props.t('listaTaxonomiaSubfamilia:erroFalhaBuscarReinos'))
        }
        return []
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
                this.notificacao('warning', this.props.t('listaTaxonomiaSubfamilia:buscarFamiliaTipoErro'), this.props.t('listaTaxonomiaSubfamilia:buscarFamiliaErroMensagem'))
                this.setState({ fetchingFamilias: false })
            }
        } catch (err) {
            this.setState({ fetchingFamilias: false })
            const { response } = err
            if (response && response.data) {
                const { error } = response.data
                console.error(error.message)
            }
            this.notificacao('error', this.props.t('common:erro'), this.props.t('listaTaxonomiaSubfamilia:erroFalhaBuscarFamilias'))
        }
        return []
    }

    renderPainelBusca(getFieldDecorator) {
        return (
            <Card title={this.props.t('listaTaxonomiaSubfamilia:buscarSubfamilia')}>
                <Form onSubmit={this.onSubmit}>
                    <Row gutter={8}>
                        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <span>{this.props.t('listaTaxonomiaSubfamilia:buscarNomeSubfamilia')}</span>
                            </Col>
                            <Col span={24}>
                                <FormItem>
                                    {getFieldDecorator('subfamilia')(
                                        <Input placeholder="Bromeliaceae" type="text" />
                                    )}
                                </FormItem>
                            </Col>
                        </Col>

                        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <span>{this.props.t('listaTaxonomiaSubfamilia:buscarNomeFamilia')}</span>
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
                                                this.requisitaListaSubfamilia({}, 1)
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

    optionFamilia = () => this.state.familias.map(item => (
        <Option key={item.id} value={item.id}>{item.nome}</Option>
    ))

    optionReino = () => this.state.reinos.map(item => (
        <Option key={item.id} value={item.id}>{item.nome}</Option>
    ))

    renderFormulario() {
        const { getFieldDecorator } = this.props.form
        const { fetchingFamilias, fetchingReinos, reinoSelecionado } = this.state

        const columns = [
            {
                title: this.props.t('listaTaxonomiaSubfamilia:colunaSubfamilia'),
                type: 'text',
                key: 'subfamilia',
                dataIndex: 'subfamilia',
                width: '23.25%',
                sorter: true
            },
            {
                title: this.props.t('listaTaxonomiaSubfamilia:colunaFamilia'),
                key: 'familia',
                dataIndex: 'familia',
                width: '23.25%',
                sorter: true
            },
            {
                title: this.props.t('listaTaxonomiaSubfamilia:colunaAutor'),
                key: 'autor',
                dataIndex: 'autor',
                width: '23.25%',
                sorter: true
            },
            {
                title: this.props.t('listaTaxonomiaSubfamilia:colunaAcao'),
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
                                    familias: [],
                                    reinoSelecionado: null
                                })
                            }
                        }
                        onOk={() => {
                            if (this.state.id === -1) {
                                if (this.props.form.getFieldsValue().nomeFamilia && this.props.form.getFieldsValue().nomeSubfamilia && this.props.form.getFieldsValue().nomeSubfamilia.trim() !== '') {
                                    this.cadastraNovaSubfamilia()
                                } else {
                                    this.openNotificationWithIcon('warning', this.props.t('common:falha'), this.props.t('listaTaxonomiaSubfamilia:validacaoInformarSubfamiliaEFamilia'))
                                }
                            } else if (this.props.form.getFieldsValue().nomeFamilia && this.props.form.getFieldsValue().nomeSubfamilia && this.props.form.getFieldsValue().nomeSubfamilia.trim() !== '') {
                                this.atualizaSubfamilia()
                            } else {
                                this.openNotificationWithIcon('warning', this.props.t('common:falha'), this.props.t('listaTaxonomiaSubfamilia:validacaoInformarSubfamiliaEFamilia'))
                            }

                            this.props.form.resetFields()
                            this.setState({
                                visibleModal: false,
                                familias: [],
                                reinoSelecionado: null
                            })
                        }}
                    >

                        <div>
                            <Row gutter={8}>
                                <SelectedFormField
                                    title={this.props.t('listaTaxonomiaSubfamilia:cadastrarNomeReino')}
                                    placeholder={this.props.t('listaTaxonomiaSubfamilia:placeholderSelecionarReino')}
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
                                    title={this.props.t('listaTaxonomiaSubfamilia:cadastrarNomeFamilia')}
                                    placeholder={reinoSelecionado ? this.props.t('listaTaxonomiaSubfamilia:placeholderSelecionarFamilia') : this.props.t('listaTaxonomiaSubfamilia:placeholderSelecionarReinoPrimeiro')}
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
                                    <span>{this.props.t('listaTaxonomiaSubfamilia:cadastrarNomeSubfamilia')}</span>
                                </Col>
                            </Row>
                            <Row gutter={8}>
                                <Col span={24}>
                                    <FormItem>
                                        {getFieldDecorator('nomeSubfamilia')(
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
                        <h2 style={{ fontWeight: 200 }}>{this.props.t('listaTaxonomiaSubfamilia:subfamilias')}</h2>
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
                    data={this.state.subfamilias}
                    metadados={this.state.metadados}
                    loading={this.state.loading}
                    changePage={(pg, pageSize, sorter) => {
                        this.setState({
                            pagina: pg,
                            loading: true
                        })
                        this.requisitaListaSubfamilia(this.state.valores, pg, pageSize, sorter)
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
const ListaTaxonomiaSubfamiliaWithForm = Form.create()(ListaTaxonomiaSubfamilia)

export default withTranslation()(ListaTaxonomiaSubfamiliaWithForm)
