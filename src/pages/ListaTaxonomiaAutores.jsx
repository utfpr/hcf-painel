import { Component } from 'react'

import {
    Divider, Modal, Card, Row, Col, Select, Input, Button, notification
} from 'antd'
import axios from 'axios'
import { withTranslation } from 'react-i18next'

import TotalRecordFound from '@/components/TotalRecordsFound'
import { recaptchaKey } from '@/config/api'
import { Form } from '@ant-design/compatible'
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'

import ModalCadastroComponent from '../components/ModalCadastroComponent'
import SimpleTableComponent from '../components/SimpleTableComponent'
import {
    isCuradorOuOperador
} from '../helpers/usuarios'

const { confirm } = Modal
const FormItem = Form.Item
const { Option } = Select

class ListaTaxonomiaAutores extends Component {
    constructor(props) {
        super(props)
        this.state = {
            metadados: {},
            autores: [],
            pagina: 1,
            visibleModal: false,
            loadingModal: false,
            loading: false,
            titulo: 'Cadastrar',
            id: -1
        }
    }

    requisitaExclusao(id) {
        this.setState({
            loading: true
        })
        axios.delete(`/autores/${id}`)
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 204) {
                    this.requisitaListaAutores(this.state.valores, this.state.pagina)
                    this.notificacao('success', this.props.t('common:excluir'), this.props.t('listaTaxonomiaAutores:sucessoExcluirAutor'))
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
            title: this.props.t('listaTaxonomiaAutores:confirmarExcluirAutor'),
            content: this.props.t('listaTaxonomiaAutores:descricaoExcluirAutor'),
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
        this.requisitaListaAutores({}, this.state.pagina)
    }

    gerarAcao(item) {
        if (isCuradorOuOperador()) {
            return (
                <span>
                    <Divider type="vertical" />
                    <a onClick={() => {
                        this.props.form.setFields({
                            nomeAutor: {
                                value: item.nome
                            },
                            nomeIniciais: {
                                value: item.observacao
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

    formataDadosAutores = autores => autores.map(item => ({
        key: item.id,
        autor: item.nome,
        acao: this.gerarAcao(item),
        observacao: item.observacao
    }))

    requisitaListaAutores = async (valores, pg, pageSize, sorter) => {
        this.setState({ loading: true })

        const campo = sorter && sorter.field ? sorter.field : 'autor'
        const ordem = sorter && sorter.order === 'descend' ? 'desc' : 'asc'

        const params = {
            pagina: pg,
            limite: pageSize || 20,
            order: `${campo}:${ordem}`,
            ...(valores && valores.autor ? { autor: valores.autor } : {})
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
                const { data } = response
                this.setState({
                    autores: this.formataDadosAutores(data.resultado),
                    metadados: data.metadados,
                    loading: false
                })
            } else if (response.status === 400) {
                this.notificacao('warning', this.props.t('listaTaxonomiaAutores:buscarAutores'), this.props.t('listaTaxonomiaAutores:buscarAutoresErro'))
                this.setState({ loading: false })
            } else {
                this.notificacao('error', this.props.t('common:erro'), this.props.t('common:erroServidorBuscarAutores'))
                this.setState({ loading: false })
            }
        } catch (err) {
            this.setState({ loading: false })
            const { response } = err
            if (response && response.data) {
                const { error } = response.data
                console.error(error.message)
            }
            this.notificacao('error', this.props.t('common:erro'), this.props.t('listaTaxonomiaAutores:erroBuscarAutores'))
        }
    }

    handleSubmit = (err, valores) => {
        if (!err) {
            this.setState({
                valores,
                loading: true
            })
            this.setState(
                {
                    valores,
                    pagina: 1,
                    loading: true
                },
                () => {
                    this.requisitaListaAutores(valores, 1)
                }
            )
        }
    }

    onSubmit = event => {
        event.preventDefault()
        this.props.form.validateFields(this.handleSubmit)
    }

    cadastraNovoAutor() {
        this.setState({
            loading: true
        })
        axios.post('/autores', {
            nome: this.props.form.getFieldsValue().nomeAutor,
            observacao: this.props.form.getFieldsValue().nomeIniciais
        })
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 204) {
                    this.requisitaListaAutores(
                        this.state.valores || {},
                        this.state.pagina
                    )
                    this.openNotificationWithIcon('success', this.props.t('common:tituloSucesso'), this.props.t('common:cadastroRealizadoSucesso'))
                } else if (response.status === 400) {
                    this.openNotificationWithIcon('warning', this.props.t('common:tituloFalha'), response.data.error.message)
                } else {
                    this.openNotificationWithIcon('error', this.props.t('common:tituloFalha'), this.props.t('listaTaxonomiaAutores:erroCadastroAutor'))
                }
                this.props.form.setFields({
                    nomeAutor: {
                        value: ''
                    },
                    nomeIniciais: {
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
                    this.openNotificationWithIcon('warning', this.props.t('common:tituloFalha'), error.message)
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
                    onClick={() => {
                        this.props.form.setFields({
                            nomeAutor: {
                                value: ''
                            },
                            nomeIniciais: {
                                value: ''
                            }
                        })
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

    atualizaAutor() {
        this.setState({
            loading: true
        })
        axios.put(`/autores/${this.state.id}`, {
            nome: this.props.form.getFieldsValue().nomeAutor,
            iniciais: this.props.form.getFieldsValue().nomeIniciais
        })
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 204) {
                    this.requisitaListaAutores(
                        this.state.valores || {},
                        this.state.pagina
                    )
                    this.openNotificationWithIcon('success', this.props.t('common:tituloSucesso'), this.props.t('common:atualizacaoRealizadaSucesso'))
                } else if (response.status === 400) {
                    this.openNotificationWithIcon('warning', this.props.t('common:tituloFalha'), response.data.error.message)
                } else {
                    this.openNotificationWithIcon('error', this.props.t('common:tituloFalha'), this.props.t('listaTaxonomiaAutores:erroAtualizarAutor'))
                }
                this.props.form.setFields({
                    nomeAutor: {
                        value: ''
                    },
                    nomeIniciais: {
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

    renderPainelBusca(getFieldDecorator) {
        return (
            <Card title={this.props.t('listaTaxonomiaAutores:buscarAutor')}>
                <Form onSubmit={this.onSubmit}>
                    <Row gutter={8}>
                        <Col span={24}>
                            <span>{this.props.t('listaTaxonomiaAutores:buscarNomeAutor')}</span>
                        </Col>
                    </Row>
                    <Row gutter={8}>
                        <Col span={24}>
                            <FormItem>
                                {getFieldDecorator('autor')(
                                    <Input placeholder="Bob Lee" type="text" />
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
                                                    metadados: {}
                                                })
                                                this.requisitaListaAutores({}, 1)
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

    optionAutores = () => this.state.autores.map(item => (
        <Option key={item.id} value={item.id}>{item.nome}</Option>
    ))

    renderFormulario() {
        const { getFieldDecorator } = this.props.form

        const columns = [
            {
                title: this.props.t('listaTaxonomiaAutores:colunaAutor'),
                type: 'text',
                key: 'autor',
                dataIndex: 'autor',
                width: '46.5%',
                sorter: true
            },
            {
                title: this.props.t('listaTaxonomiaAutores:colunaObservacao'),
                type: 'text',
                key: 'observacao',
                dataIndex: 'observacao',
                width: '46.5%',
                sorter: true
            },
            {
                title: this.props.t('listaTaxonomiaAutores:colunaAcao'),
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
                                this.props.form.setFields({
                                    nomeAutor: {
                                        value: ''
                                    },
                                    nomeIniciais: {
                                        value: ''
                                    }
                                })
                                this.setState({
                                    visibleModal: false
                                })
                            }
                        }
                        onOk={() => {
                            if (this.state.id === -1) {
                                if (this.props.form.getFieldsValue().nomeAutor && this.props.form.getFieldsValue().nomeAutor.trim() !== '') {
                                    this.cadastraNovoAutor()
                                } else {
                                    this.openNotificationWithIcon('warning', this.props.t('common:tituloFalha'), this.props.t('listaTaxonomiaAutores:validacaoInformarAutor'))
                                }
                            } else if (this.props.form.getFieldsValue().nomeAutor && this.props.form.getFieldsValue().nomeAutor.trim() !== '') {
                                this.atualizaAutor()
                            } else {
                                this.openNotificationWithIcon('warning', this.props.t('common:tituloFalha'), this.props.t('listaTaxonomiaAutores:validacaoInformarAutor'))
                            }
                            this.setState({
                                visibleModal: false
                            })
                        }}
                    >

                        <div>
                            <Row gutter={8}>
                                <Col span={24}>
                                    <span>{this.props.t('listaTaxonomiaAutores:cadastroNomeAutor')}</span>
                                </Col>
                            </Row>
                            <Row gutter={8}>
                                <Col span={24}>
                                    <FormItem>
                                        {getFieldDecorator('nomeAutor')(
                                            <Input placeholder="Candance" type="text" />
                                        )}
                                    </FormItem>
                                </Col>
                            </Row>

                            <Row gutter={8} style={{ marginTop: 16 }}>
                                <Col span={24}>
                                    <span>{this.props.t('listaTaxonomiaAutores:cadastroObservacao')}</span>
                                </Col>
                            </Row>
                            <Row gutter={8}>
                                <Col span={24}>
                                    <FormItem>
                                        {getFieldDecorator('nomeIniciais')(
                                            <Input placeholder="B.L" type="text" />
                                        )}
                                    </FormItem>
                                </Col>
                            </Row>
                        </div>

                    </ModalCadastroComponent>
                </Form>

                <Row gutter={24} style={{ marginBottom: '20px' }}>
                    <Col xs={24} sm={14} md={18} lg={20} xl={20}>
                        <h2 style={{ fontWeight: 200 }}>{this.props.t('listaTaxonomiaAutores:autores')}</h2>
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
                    data={this.state.autores}
                    metadados={this.state.metadados}
                    loading={this.state.loading}
                    changePage={(pg, pageSize, sorter) => {
                        this.setState({
                            pagina: pg,
                            loading: true
                        })
                        this.requisitaListaAutores(this.state.valores, pg, pageSize, sorter)
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
const ListaTaxonomiaAutoresWithForm = Form.create()(ListaTaxonomiaAutores)

export default withTranslation()(ListaTaxonomiaAutoresWithForm)
