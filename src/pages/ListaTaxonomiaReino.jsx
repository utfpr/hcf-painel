import { Component } from 'react'

import {
    Divider, Modal, Card, Row, Col,
    Input, Button, notification,
    Select
} from 'antd'
import axios from 'axios'

import TotalRecordFound from '@/components/TotalRecordsFound'
import { recaptchaKey } from '@/config/api'
import i18n from '@/i18n'
import { Form } from '@ant-design/compatible'
import { EditOutlined, PlusOutlined } from '@ant-design/icons'

import ModalCadastroComponent from '../components/ModalCadastroComponent'
import SimpleTableComponent from '../components/SimpleTableComponent'
import { isCuradorOuOperador } from '../helpers/usuarios'

const { confirm } = Modal
const FormItem = Form.Item

const { Option } = Select

const t = i18n.t

const columns = [
    {
        title: t('listaTaxonomiaReino:colunaReino'),
        type: 'text',
        key: 'reino',
        dataIndex: 'reino',
        sorter: true
    },
    {
        title: t('listaTaxonomiaReino:colunaAcao'),
        key: 'acao',
        width: 50
    }
]

class ListaTaxonomiaReino extends Component {
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
            titulo: t('common:cadastrar'),
            id: -1
        }
    }

    // requisitaExclusao(id) {
    //     this.setState({
    //         loading: true
    //     })
    //     axios.delete(/familias/${id})
    //         .then(response => {
    //             this.setState({
    //                 loading: false
    //             })
    //             if (response.status === 204) {
    //                 this.requisitaListaFamilia(this.state.valores, this.state.pagina)
    //                 this.notificacao('success', 'Excluir família', 'A família foi excluída com sucesso.')
    //             }
    //         })
    //         .catch(err => {
    //             this.setState({
    //                 loading: false
    //             })
    //             const { response } = err
    //             if (response && response.data) {
    //                 const { error } = response.data
    //                 console.error(error.message)
    //             }
    //         })
    // }

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
            title: t('listaTaxonomiaReino:confirmacaoExcluirReino'),
            content: t('listaTaxonomiaReino:descricaoExcluirReino'),
            okText: t('common:sim'),
            okType: 'danger',
            cancelText: t('common:nao'),
            onOk() {
                self.requisitaExclusao(id)
            },
            onCancel() {
            }
        })
    }

    componentDidMount() {
        // this.requisitaListaFamilia({}, this.state.pagina)
        this.requisitaReinos()
    }

    gerarAcao(item) {
        if (isCuradorOuOperador()) {
            return (
                <span>
                    <a onClick={() => {
                        this.props.form.setFields({
                            nomeReino: {
                                value: item.nome
                            }
                        })
                        this.setState({
                            visibleModal: true,
                            id: item.id,
                            titulo: t('common:atualizar')
                        })
                    }}
                    >
                        <EditOutlined style={{ color: '#FFCC00' }} />
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

    formataDadosReino = reinos => reinos.map(item => ({
        key: item.id,
        reino: item.nome,
        acao: this.gerarAcao(item)
    }))

    handleSubmit = (err, valores) => {
        if (!err) {
            this.setState({
                valores,
                loading: true
            })
            this.requisitaReinos(valores, this.state.pagina, this.state.pageSize)
        }
    }

    onSubmit = event => {
        event.preventDefault()
        this.props.form.validateFields(this.handleSubmit)
    }

    // ! sadfsdfsd
    cadastraNovoReino() {
        this.setState({
            loading: true
        })
        axios.post('/reinos', {
            nome: this.props.form.getFieldsValue().nomeReino
        })
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 204) {
                    this.requisitaReinos()
                    this.openNotificationWithIcon('success', t('common:tituloSucesso'), t('common:cadastroRealizadoSucesso'))
                } else if (response.status === 400) {
                    this.openNotificationWithIcon('warning', t('common:tituloFalha'), response.data.error)
                } else {
                    this.openNotificationWithIcon('error', t('common:tituloFalha'), t('listaTaxonomiaReino:erroCadastrarReino'))
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

                    this.openNotificationWithIcon('error', t('common:tituloFalha'), t('listaTaxonomiaReino:erroReinoJaCadastrado'))
                }
            })
            .catch(this.catchRequestError)
    }

    atualizaReino() {
        this.setState({
            loading: true
        })
        axios.put(`/reinos/${this.state.id}`, {
            nome: this.props.form.getFieldsValue().nomeReino
        })
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 204) {
                    this.requisitaReinos()
                    this.openNotificationWithIcon('success', t('common:tituloSucesso'), t('common:atualizacaoRealizadaSucesso'))
                } else if (response.status === 400) {
                    this.openNotificationWithIcon('warning', t('common:tituloFalha'), response.data.error.message)
                } else {
                    this.openNotificationWithIcon('error', t('common:tituloFalha'), t('listaTaxonomiaReino:erroAtualizarReino'))
                }
                this.props.form.setFields({
                    nomeReino: {
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
            <Card title={t('listaTaxonomiaReino:buscarReino')}>
                <Form onSubmit={this.onSubmit}>
                    <Row gutter={8}>
                        <Col span={24}>
                            <span>
                                {t('listaTaxonomiaReino:nomeReino')}
                            </span>
                        </Col>
                    </Row>
                    <Row gutter={8}>
                        <Col span={24}>
                            <FormItem>
                                {getFieldDecorator('reino')(
                                    <Input placeholder="Plantae" type="text" />
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
                                                this.requisitaReinos({}, 1)
                                            }}
                                            className="login-form-button"
                                        >
                                            {t('common:limpar')}
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
                                            {t('common:pesquisar')}
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

    requisitaReinos = async (valores, pg, pageSize, sorter) => {
        this.setState({ loading: true })

        const campo = sorter && sorter.field ? sorter.field : 'reino'
        const ordem = sorter && sorter.order === 'descend' ? 'desc' : 'asc'
        const params = {
            pagina: pg,
            limite: pageSize || 20,
            order: `${campo}:${ordem}`,
            ...(valores && valores.reino ? { reino: valores.reino } : {})
        }

        const isLogged = Boolean(localStorage.getItem('token'))

        if (!isLogged && window.grecaptcha && window.grecaptcha.ready) {
            try {
                await new Promise(resolve => window.grecaptcha.ready(resolve))
                const token = await window.grecaptcha.execute(recaptchaKey, { action: 'reinos' })
                params.recaptchaToken = token
            } catch (error) {
                console.error(t('listaTaxonomiaReino:erroExecutarRecaptcha'), error)
                this.setState({ loading: false })
                this.notificacao('error', t('common:erro'), t('listaTaxonomiaReino:erroValidarRecaptcha'))
                return
            }
        }

        axios.get('/reinos', { params })
            .then(response => {
                this.setState({ loading: false })
                if (response.status === 200) {
                    this.setState({
                        reinos: this.formataDadosReino(response.data.resultado),
                        metadados: response.data.metadados
                    })
                }
            })
            .catch(err => {
                this.setState({ loading: false })
                console.error(err.response?.data?.error?.message)
                this.notificacao('error', t('common:erro'), t('listaTaxonomiaReino:erroBuscarReinos'))
            })
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
                            titulo: t('common:cadastrar'),
                            id: -1
                        })
                    }}
                    style={{ backgroundColor: '#5CB85C', borderColor: '#5CB85C', width: '100%' }}
                >
                    {t('common:adicionar')}
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
                                if (this.props.form.getFieldsValue().nomeReino && this.props.form.getFieldsValue().nomeReino.trim() !== '') {
                                    this.cadastraNovoReino()
                                } else {
                                    this.openNotificationWithIcon('warning', t('common:tituloFalha'), t('listaTaxonomiaReino:erroReinoJaCadastrado'))
                                }
                            } else if (this.props.form.getFieldsValue().nomeReino && this.props.form.getFieldsValue().nomeReino.trim() !== '') {
                                this.atualizaReino()
                            } else {
                                this.openNotificationWithIcon('warning', t('common:tituloFalha'), t('listaTaxonomiaReino:erroReinoJaCadastrado'))
                            }
                            this.setState({
                                visibleModal: false
                            })
                        }}
                    >

                        <div>
                            <Row gutter={8} style={{ marginTop: 16 }}>
                                <Col span={24}>
                                    <span>{t('listaTaxonomiaReino:informarNomeReino')}</span>
                                </Col>
                            </Row>
                            <Row gutter={8}>
                                <Col span={24}>
                                    <FormItem>
                                        {getFieldDecorator('nomeReino')(
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
                        <h2 style={{ fontWeight: 200 }}>{t('listaTaxonomiaReino:reinos')}</h2>
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
                    data={this.state.reinos}
                    metadados={this.state.metadados}
                    loading={this.state.loading}
                    changePage={(pg, pageSize, sorter) => {
                        this.setState({
                            pagina: pg,
                            loading: true
                        })
                        this.requisitaReinos(this.state.valores, pg, pageSize, sorter)
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
export default Form.create()(ListaTaxonomiaReino)
