import { Component } from 'react'

import {
    Divider, Modal, Card, Row, Col,
    Input, Button, notification,
    Select
} from 'antd'
import axios from 'axios'

import TotalRecordFound from '@/components/TotalRecordsFound'
import { Form } from '@ant-design/compatible'
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'

import ModalCadastroComponent from '../components/ModalCadastroComponent'
import SimpleTableComponent from '../components/SimpleTableComponent'
import { isCuradorOuOperador } from '../helpers/usuarios'
import { recaptchaKey } from '@/config/api'

const { confirm } = Modal
const FormItem = Form.Item

const { Option } = Select


const columns = [
    {
        title: 'Família',
        type: 'text',
        key: 'familia',
        dataIndex: 'familia',
        sorter: true,
        width: '46.5%'
    },
    {
        title: 'Reino',
        type: 'text',
        key: 'reino',
        dataIndex: 'reino',
        sorter: true,
        width: '46.5%'
    },
    {
        title: 'Ação',
        key: 'acao',
        width: 100
    }
]

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
            titulo: 'Cadastrar',
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
                this.notificacao('success', 'Excluir família', 'A família foi excluída com sucesso.')
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
                    this.notificacao('error', 'Erro ao excluir família', error.code)
                } else {
                    this.notificacao('error', 'Erro ao excluir família', 'Ocorreu um erro inesperado ao tentar excluir a família.')
                }
                console.error(error)
            } else {
                this.notificacao('error', 'Erro ao excluir família', 'Falha na comunicação com o servidor.')
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
            title: 'Você tem certeza que deseja excluir esta família?',
            content: 'Ao clicar em SIM, a família será excluída.',
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
                            titulo: 'Atualizar'
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
    
        await new Promise(resolve => window.grecaptcha.ready(resolve))
    
        const token = await window.grecaptcha.execute(recaptchaKey, { action: 'familias' })
    
        const campo = sorter && sorter.field ? sorter.field : 'familia'
        const ordem = sorter && sorter.order === 'descend' ? 'desc' : 'asc'
    
        const params = {
            pagina: pg,
            limite: pageSize || 20,
            order: `${campo}:${ordem}`,
            recaptchaToken: token,
            ...(valores && valores.familia ? { familia: valores.familia } : {})
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
                    this.notificacao('warning', 'Buscar família', 'Erro ao buscar as famílias.')
                } else {
                    this.notificacao('error', 'Error', 'Erro de servidor ao buscar as famílias.')
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
                    this.openNotificationWithIcon('success', 'Sucesso', 'O cadastro foi realizado com sucesso.')
                } else if (response.status === 400) {
                    this.openNotificationWithIcon('warning', 'Falha', response.data.error)
                } else {
                    this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao cadastrar a nova família, tente novamente.')
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

                    this.openNotificationWithIcon('error', 'Falha', 'Família já cadastrada.')
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
                    this.openNotificationWithIcon('success', 'Sucesso', 'A atualização foi realizada com sucesso.')
                } else if (response.status === 400) {
                    this.openNotificationWithIcon('warning', 'Falha', response.data.error.message)
                } else {
                    this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao atualizar a família, tente novamente.')
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
            <Card title="Buscar família">
                <Form onSubmit={this.onSubmit}>
                    <Row gutter={8}>
                        <Col span={24}>
                            <span>Nome da família:</span>
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

    requisitaReinos = () => {
        axios.get('/reinos', {
            params: {
                limite: 9999999
            }
        })
            .then(response => {
                if (response.status === 200) {
                    this.setState({
                        reinos: response.data.resultado
                    })
                }
            })
            .catch(err => {
                const { response } = err
                if (response && response.data) {
                    const { error } = response.data
                    console.error(error.message)
                }
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
                            titulo: 'Cadastrar',
                            id: -1
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

    optionReino = () => this.state.reinos.map(item => (
        <Option value={item.id}>{item.nome}</Option>
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
                                if (this.props.form.getFieldsValue().nomeFamilia && this.props.form.getFieldsValue().nomeFamilia.trim() !== '') {
                                    this.cadastraNovaFamilia()
                                } else {
                                    this.openNotificationWithIcon('warning', 'Falha', 'Informe o nome da família.')
                                }
                            } else if (this.props.form.getFieldsValue().nomeFamilia && this.props.form.getFieldsValue().nomeFamilia.trim() !== '') {
                                this.atualizaFamilia()
                            } else {
                                this.openNotificationWithIcon('warning', 'Falha', 'Informe o nome da família.')
                            }
                            this.setState({
                                visibleModal: false
                            })
                        }}
                    >

                        <div>
                            <Row gutter={8}>
                                <Col span={24}>
                                    <span>Nome do reino:</span>
                                </Col>
                            </Row>
                            <Row gutter={8}>
                                <Col span={24}>
                                    <FormItem>
                                        {getFieldDecorator('nomeReino')(
                                            <Select
                                                showSearch
                                                style={{ width: '100%' }}
                                                placeholder="Selecione um reino"
                                                optionFilterProp="children"
                                            >

                                                {this.optionReino()}
                                            </Select>
                                        )}
                                    </FormItem>
                                </Col>
                            </Row>
                            <Row gutter={8} style={{ marginTop: 16 }}>
                                <Col span={24}>
                                    <span>Informe o nome da família:</span>
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
                        <h2 style={{ fontWeight: 200 }}>Famílias</h2>
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
export default Form.create()(ListaTaxonomiaFamilia)
