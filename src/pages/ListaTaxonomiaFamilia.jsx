import { Component } from 'react'

import {
    Divider, Modal, Card, Row, Col,
    Input, Button, notification,
    Select, Spin
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

class ListaTaxonomiaFamilia extends Component {
    constructor(props) {
        super(props)
        this.state = {
            reinos: [],
            familias: [],
            metadados: {},
            pagina: 1,
            visibleModal: false,
            loadingModal: false,
            loading: false,
            fetchingReinos: false,
            titulo: this.props.t('common:cadastrar'),
            id: -1
        }
    }

    requisitaExclusao(id) {
        this.setState({
            loading: true
        })
        axios.delete(`/familias/${id}`)
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 204) {
                    this.requisitaListaFamilia(this.state.valores, this.state.pagina)
                    this.notificacao('success', this.props.t('listaTaxonomiaFamilia:excluirFamilia'), this.props.t('listaTaxonomiaFamilia:familiaExcluidaSucesso'))
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
                        this.notificacao('error', this.props.t('listaTaxonomiaFamilia:erroExcluirFamilia'), error.code)
                    } else {
                        this.notificacao('error', this.props.t('listaTaxonomiaFamilia:erroExcluirFamilia'), this.props.t('listaTaxonomiaFamilia:erroExcluirFamiliaInesperado'))
                    }
                    console.error(error)
                } else {
                    this.notificacao('error', this.props.t('listaTaxonomiaFamilia:erroExcluirFamilia'), this.props.t('common:erroComunicacaoServidor'))
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
            title: this.props.t('listaTaxonomiaFamilia:confirmacaoExcluirFamilia'),
            content: this.props.t('listaTaxonomiaFamilia:descricaoExcluirFamilia'),
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
        this.requisitaListaFamilia({}, this.state.pagina)
        this.requisitaReinos()
    }

    gerarAcao(item) {
        if (isCuradorOuOperador()) {
            return (
                <span>
                    <Divider type="vertical" />
                    <a onClick={() => {
                        this.props.form.setFields({
                            nomeFamilia: {
                                value: item.nome
                            }
                        })
                        this.setState({
                            visibleModal: true,
                            id: item.id,
                            titulo: this.props.t('common:atualizar')
                        })
                    }}
                    >
                        <EditOutlined style={{ color: '#FFCC00' }} />
                    </a>
                    <Divider type="vertical" />
                    <a onClick={() => this.mostraMensagemDelete(item.id)}>
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

    formataDadosFamilia = familias => familias.map(item => ({
        key: item.id,
        familia: item.nome,
        reino: item.reino?.nome,
        acao: this.gerarAcao(item)
    }))

    requisitaListaFamilia = async (valores, pg, pageSize, sorter) => {
        this.setState({ loading: true })

        const campo = sorter && sorter.field ? sorter.field : 'familia'
        const ordem = sorter && sorter.order === 'descend' ? 'desc' : 'asc'

        const params = {
            pagina: pg,
            limite: pageSize || 20,
            order: `${campo}:${ordem}`,
            ...(valores && valores.familia ? { familia: valores.familia } : {})
        }

        const isLogged = Boolean(localStorage.getItem('token'))

        if (!isLogged && window.grecaptcha && window.grecaptcha.ready) {
            try {
                await new Promise(resolve => window.grecaptcha.ready(resolve))
                const token = await window.grecaptcha.execute(recaptchaKey, { action: 'familias' })
                params.recaptchaToken = token
            } catch (error) {
                console.error(this.props.t('common:erroExecutarRecaptcha'), error)
                this.setState({ loading: false })
                this.notificacao('error', this.props.t('common:erro'), this.props.t('common:erroValidarRecaptcha'))
                return
            }
        }

        axios.get('/familias', { params })
            .then(response => {
                this.setState({ loading: false })
                if (response.status === 200) {
                    const { data } = response
                    this.setState({
                        familias: this.formataDadosFamilia(data.resultado),
                        metadados: data.metadados
                    })
                } else if (response.status === 400) {
                    this.notificacao('warning', this.props.t('listaTaxonomiaFamilia:notificacaoBuscarFamilia'), this.props.t('listaTaxonomiaFamilia:erroBuscarFamilias'))
                } else {
                    this.notificacao('error', this.props.t('common:error'), this.props.t('listaTaxonomiaFamilia:erroServidorBuscarFamilias'))
                }
            })
            .catch(err => {
                this.setState({ loading: false })
                const { response } = err
                if (response && response.data) {
                    const { error } = response.data
                    console.error(error.message)
                }
            })
    }

    handleSubmit = (err, valores) => {
        if (!err) {
            this.setState({
                valores,
                loading: true
            })
            this.requisitaListaFamilia(valores, this.state.pagina, this.state.pageSize)
        }
    }

    onSubmit = event => {
        event.preventDefault()
        this.props.form.validateFields(this.handleSubmit)
    }

    cadastraNovaFamilia() {
        this.setState({
            loading: true
        })
        axios.post('/familias', {
            nome: this.props.form.getFieldsValue().nomeFamilia,
            reinoId: this.props.form.getFieldsValue().nomeReino
        })
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 204) {
                    this.requisitaListaFamilia()
                    this.openNotificationWithIcon('success', this.props.t('common:sucesso'), this.props.t('common:cadastroRealizadoSucesso'))
                } else if (response.status === 400) {
                    this.openNotificationWithIcon('warning', this.props.t('common:falha'), response.data.error)
                } else {
                    this.openNotificationWithIcon('error', this.props.t('common:falha'), this.props.t('listaTaxonomiaFamilia:erroCadastrarFamilia'))
                }
                this.props.form.setFields({
                    nomeFamilia: {
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

                    this.openNotificationWithIcon('error', this.props.t('common:falha'), this.props.t('listaTaxonomiaFamilia:erroFamiliaJaCadastrada'))
                }
            })
            .catch(this.catchRequestError)
    }

    atualizaFamilia() {
        this.setState({
            loading: true
        })
        axios.put(`/familias/${this.state.id}`, {
            nome: this.props.form.getFieldsValue().nomeFamilia
        })
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 204) {
                    this.requisitaListaFamilia()
                    this.openNotificationWithIcon('success', this.props.t('common:sucesso'), this.props.t('common:atualizacaoRealizadaSucesso'))
                } else if (response.status === 400) {
                    this.openNotificationWithIcon('warning', this.props.t('common:falha'), response.data.error.message)
                } else {
                    this.openNotificationWithIcon('error', this.props.t('common:falha'), this.props.t('listaTaxonomiaFamilia:erroAtualizarFamilia'))
                }
                this.props.form.setFields({
                    nomeFamilia: {
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

    renderPainelBusca() {
        const { getFieldDecorator } = this.props.form
        return (
            <Card title={this.props.t('listaTaxonomiaFamilia:buscarFamilia')}>
                <Form onSubmit={this.onSubmit}>
                    <Row gutter={8}>
                        <Col span={24}>
                            <span>{this.props.t('listaTaxonomiaFamilia:nomeFamilia')}</span>
                        </Col>
                    </Row>
                    <Row gutter={8}>
                        <Col span={24}>
                            <FormItem>
                                {getFieldDecorator('familia')(
                                    <Input placeholder="Passiflora edulis" type="text" />
                                )}
                            </FormItem>
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
                                                this.requisitaListaFamilia({}, 1)
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
            this.notificacao('error', this.props.t('common:erro'), this.props.t('listaTaxonomiaFamilia:erroBuscarReinos'))
        }
    }

    renderAdd = () => {
        if (isCuradorOuOperador()) {
            return (
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        this.setState({
                            visibleModal: true,
                            titulo: this.props.t('common:cadastrar'),
                            id: -1
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

    optionReino = () => this.state.reinos.map(item => (
        <Option key={item.id} value={item.id}>{item.nome}</Option>
    ))

    renderFormulario() {
        const { getFieldDecorator } = this.props.form
        const { fetchingReinos } = this.state

        const columns = [
            {
                title: this.props.t('listaTaxonomiaFamilia:colunaFamilia'),
                type: 'text',
                key: 'familia',
                dataIndex: 'familia',
                sorter: true,
                width: '46.5%'
            },
            {
                title: this.props.t('listaTaxonomiaFamilia:colunaReino'),
                type: 'text',
                key: 'reino',
                dataIndex: 'reino',
                sorter: true,
                width: '46.5%'
            },
            {
                title: this.props.t('listaTaxonomiaFamilia:colunaAcao'),
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
                                this.setState({
                                    visibleModal: false
                                })
                            }
                        }
                        onOk={() => {
                            if (this.state.id === -1) {
                                if (this.props.form.getFieldsValue().nomeFamilia && this.props.form.getFieldsValue().nomeFamilia.trim() !== '') {
                                    this.cadastraNovaFamilia()
                                } else {
                                    this.openNotificationWithIcon('warning', this.props.t('common:falha'), this.props.t('listaTaxonomiaFamilia:informarNomeFamilia'))
                                }
                            } else if (this.props.form.getFieldsValue().nomeFamilia && this.props.form.getFieldsValue().nomeFamilia.trim() !== '') {
                                this.atualizaFamilia()
                            } else {
                                this.openNotificationWithIcon('warning', this.props.t('common:falha'), this.props.t('listaTaxonomiaFamilia:informarNomeFamilia'))
                            }
                            this.setState({
                                visibleModal: false
                            })
                        }}
                    >

                        <div>
                            <Row gutter={8}>
                                <SelectedFormField
                                    title={this.props.t('listaTaxonomiaFamilia:nomeReino')}
                                    placeholder={this.props.t('listaTaxonomiaFamilia:selecioneReino')}
                                    fieldName="nomeReino"
                                    getFieldDecorator={getFieldDecorator}
                                    onSearch={searchText => {
                                        this.requisitaReinos(searchText || '')
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
                                <Col span={24}>
                                    <span>{this.props.t('listaTaxonomiaFamilia:informarNomeFamiliaLabel')}</span>
                                </Col>
                            </Row>
                            <Row gutter={8}>
                                <Col span={24}>
                                    <FormItem>
                                        {getFieldDecorator('nomeFamilia')(
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
                        <h2 style={{ fontWeight: 200 }}>{this.props.t('listaTaxonomiaFamilia:familias')}</h2>
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
                    data={this.state.familias}
                    metadados={this.state.metadados}
                    loading={this.state.loading}
                    changePage={(pg, pageSize, sorter) => {
                        this.setState({
                            pagina: pg,
                            loading: true
                        })
                        this.requisitaListaFamilia(this.state.valores, pg, pageSize, sorter)
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
const ListaTaxonomiaFamiliaWithForm = Form.create()(ListaTaxonomiaFamilia)

export default withTranslation()(ListaTaxonomiaFamiliaWithForm)
