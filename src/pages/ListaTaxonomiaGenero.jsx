import { Component } from 'react'

import {
    Divider, Spin, Modal, Card, Row, Col,
    Select, Input, Button, notification
} from 'antd'
import axios from 'axios'

import { Form } from '@ant-design/compatible'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'

import ModalCadastroComponent from '../components/ModalCadastroComponent'
import SimpleTableComponent from '../components/SimpleTableComponent'
import { isCuradorOuOperador } from '../helpers/usuarios'

const { confirm } = Modal
const FormItem = Form.Item
const { Option } = Select

const columns = [
    {
        title: 'Genero',
        type: 'text',
        key: 'Genero'
    },
    {
        title: 'Ação',
        key: 'acao'
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
        axios.delete(`/api/generos/${id}`)
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 204) {
                    this.requisitaListaGenero(this.state.valores, this.state.pagina)
                    this.notificacao('success', 'Excluir', 'O Genero foi excluída com sucesso.')
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
            title: 'Você tem certeza que deseja excluir este genero?',
            content: 'Ao clicar em SIM, o genero será excluída.',
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
                                    value: item.familia_id
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
        Genero: item.nome,
        acao: this.gerarAcao(item)
    }))

    renderAdd = () => {
        if (isCuradorOuOperador()) {
            return (
                <Button
                    type="primary"
                    icon="plus"
                    onClick={() => {
                        this.setState({
                            visibleModal: true,
                            titulo: 'Cadastrar',
                            id: -1
                        })
                    }}
                    style={{ backgroundColor: '#5CB85C', borderColor: '#5CB85C' }}
                >
                    Adicionar
                </Button>
            )
        }
        return undefined
    }

    requisitaListaGenero = (valores, pg) => {
        const params = {
            pagina: pg
        }

        if (valores !== undefined) {
            const { genero } = valores

            if (genero) {
                params.genero = genero
            }
        }
        axios.get('/generos', { params })
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 200) {
                    const { data } = response
                    this.setState({
                        generos: this.formataDadosGenero(data.resultado),
                        metadados: data.metadados
                    })
                } else if (response.status === 400) {
                    this.notificacao('warning', 'Buscar Genero', 'Erro ao buscar os generos.')
                } else {
                    this.notificacao('error', 'Error', 'Erro de servidor ao buscar os generos.')
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
        axios.post('/generos/', {
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
                    this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao cadastrar o novo genero, tente novamente.')
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
        axios.put(`/api/generos/${this.state.id}`, {
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
                    this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao atualizar o genero, tente novamente.')
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
        axios.get('/familias/', {
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
                    this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao buscar familias, tente novamente.')
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
            <Card title="Buscar Genero">
                <Form onSubmit={this.onSubmit}>
                    <Row gutter={8}>
                        <Col span={24}>
                            <span>Nome do genero:</span>
                        </Col>
                    </Row>
                    <Row gutter={8}>
                        <Col span={24}>
                            <FormItem>
                                {getFieldDecorator('genero')(
                                    <Input placeholder="Passion Flower" type="text" />
                                )}
                            </FormItem>
                        </Col>
                    </Row>

                    <Row>
                        <Col span={24}>
                            <Row type="flex" justify="end" gutter={4}>
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
                                    this.openNotificationWithIcon('warning', 'Falha', 'Informe o nome do genero e da familia.')
                                }
                            } else if (this.props.form.getFieldsValue().nomeFamilia && this.props.form.getFieldsValue().nomeGenero && this.props.form.getFieldsValue().nomeGenero.trim() !== '') {
                                this.atualizaGenero()
                            } else {
                                this.openNotificationWithIcon('warning', 'Falha', 'Informe o nome do genero e da familia.')
                            }
                            this.setState({
                                visibleModal: false
                            })
                        }}
                    >

                        <div>
                            <Row gutter={8}>
                                <Col span={24}>
                                    <span>Nome da familia:</span>
                                </Col>
                            </Row>
                            <Row gutter={8}>
                                <Col span={24}>
                                    <FormItem>
                                        {getFieldDecorator('nomeFamilia')(
                                            <Select
                                                showSearch
                                                style={{ width: '100%' }}
                                                placeholder="Selecione uma familia"
                                                optionFilterProp="children"
                                            >

                                                {this.optionFamilia()}
                                            </Select>
                                        )}
                                    </FormItem>
                                </Col>
                            </Row>
                            <Row gutter={8}>
                                <Col span={24}>
                                    <span>Nome do genero:</span>
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
                    <Col xs={24} sm={14} md={18} lg={20} xl={21}>
                        <h2 style={{ fontWeight: 200 }}>Generos</h2>
                    </Col>
                    <Col xs={24} sm={10} md={6} lg={4} xl={3}>
                        {this.renderAdd()}
                    </Col>
                </Row>

                <Divider dashed />
                {this.renderPainelBusca(getFieldDecorator)}
                <Divider dashed />
                <SimpleTableComponent
                    columns={columns}
                    data={this.state.generos}
                    metadados={this.state.metadados}
                    loading={this.state.loading}
                    changePage={pg => {
                        this.setState({
                            pagina: pg,
                            loading: true
                        })
                        this.requisitaListaGenero(this.state.valores, pg)
                    }}
                />
                <Divider dashed />
            </div>
        )
    }

    render() {
        if (this.state.loading) {
            return (
                <Spin tip="Carregando...">
                    {this.renderFormulario()}
                </Spin>
            )
        }
        return (
            this.renderFormulario()
        )
    }
}
export default Form.create()(ListaTaxonomiaGenero)
