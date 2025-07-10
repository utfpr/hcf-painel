import { Component } from 'react'

import {
    Divider, Spin, Modal, Card, Row, Col,
    Select, Input, Button, notification
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
        title: 'Gênero',
        type: 'text',
        key: 'genero',
        dataIndex: 'genero',
        sorter: true,
        width: '30.4%'
    },
    {
        title: 'Família',
        type: 'text',
        key: 'familia',
        dataIndex: 'familia',
        sorter: true,
        width: '30.4%'
    },
    {
        title: 'Ação',
        key: 'acao',
        width: 100
    }
]

class ListaTaxonomiaGenero extends Component {
    constructor(props) {
        super(props)
        this.state = {
            generos: [],
            metadados: {},
            familias: [],
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
        axios.delete(`/generos/${id}`)
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 204) {
                    this.requisitaListaGenero(this.state.valores, this.state.pagina)
                    this.notificacao('success', 'Excluir', 'O gênero foi excluída com sucesso.')
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
        const self = this
        confirm({
            title: 'Você tem certeza que deseja excluir este gênero?',
            content: 'Ao clicar em SIM, o gênero será excluída.',
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
        this.requisitaListaGenero({}, this.state.pagina)
        this.requisitaFamilias()
    }

    gerarAcao(item) {
        if (isCuradorOuOperador()) {
            return (
                <span>
                    <Divider type="vertical" />
                    <a
                        href="#"
                        onClick={() => {
                            this.props.form.setFields({
                                nomeGenero: {
                                    value: item.nome
                                },
                                nomeFamilia: {
                                    value: { key: item.familia.id, label: item.familia.nome }
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
    }))

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
                    this.openNotificationWithIcon('success', 'Sucesso', 'O cadastro foi realizado com sucesso.')
                } else if (response.status === 400) {
                    this.openNotificationWithIcon('warning', 'Falha', response.data.error.message)
                } else {
                    this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao cadastrar o novo gênero, tente novamente.')
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
        axios.put(`/generos/${this.state.id}`, {
            nome: this.props.form.getFieldsValue().nomeGenero,
            familia_id: this.props.form.getFieldsValue().nomeFamilia
        })
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 204) {
                    this.requisitaListaGenero()
                    this.openNotificationWithIcon('success', 'Sucesso', 'A atualização foi realizada com sucesso.')
                } else if (response.status === 400) {
                    this.openNotificationWithIcon('warning', 'Falha', response.data.error.message)
                } else {
                    this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao atualizar o gênero, tente novamente.')
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

    requisitaFamilias = () => {
        axios.get('/familias', {
            params: {
                limite: 9999999
            }
        })
            .then(response => {
                if (response.status === 200) {
                    this.setState({
                        familias: response.data.resultado
                    })
                } else {
                    this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao buscar famílias, tente novamente.')
                }
            })
            .catch(err => {
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
            <Card title="Buscar gênero">
                <Form onSubmit={this.onSubmit}>
                    <Row gutter={8}>
                        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <span>Nome do gênero:</span>
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

    optionFamilia = () => this.state.familias.map(item => (
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
                                if (this.props.form.getFieldsValue().nomeFamilia && this.props.form.getFieldsValue().nomeGenero && this.props.form.getFieldsValue().nomeGenero.trim() !== '') {
                                    this.cadastraNovaGenero()
                                } else {
                                    this.openNotificationWithIcon('warning', 'Falha', 'Informe o nome do gênero e da família.')
                                }
                            } else if (this.props.form.getFieldsValue().nomeFamilia && this.props.form.getFieldsValue().nomeGenero && this.props.form.getFieldsValue().nomeGenero.trim() !== '') {
                                this.atualizaGenero()
                            } else {
                                this.openNotificationWithIcon('warning', 'Falha', 'Informe o nome do gênero e da família.')
                            }
                            this.setState({
                                visibleModal: false
                            })
                        }}
                    >

                        <div>
                            <Row gutter={8} style={{ marginTop: 16 }}>
                                <Col span={24}>
                                    <span>Nome da família:</span>
                                </Col>
                            </Row>
                            <Row gutter={8}>
                                <Col span={24}>
                                    <FormItem>
                                        {getFieldDecorator('nomeFamilia')(
                                            <Select
                                                showSearch
                                                style={{ width: '100%' }}
                                                placeholder="Selecione uma família"
                                                optionFilterProp="children"
                                            >

                                                {this.optionFamilia()}
                                            </Select>
                                        )}
                                    </FormItem>
                                </Col>
                            </Row>
                            <Row gutter={8} style={{ marginTop: 16 }}>
                                <Col span={24}>
                                    <span>Nome do gênero:</span>
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
                        <h2 style={{ fontWeight: 200 }}>Gêneros</h2>
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
export default Form.create()(ListaTaxonomiaGenero)
