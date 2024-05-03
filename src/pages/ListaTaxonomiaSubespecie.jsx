import { Component } from 'react'

import {
    Divider, Modal, Spin, Card, Row, Col,
    Select, Input, Button, notification
} from 'antd'
import axios from 'axios'

import { Form } from '@ant-design/compatible'
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'

import ModalCadastroComponent from '../components/ModalCadastroComponent'
import SimpleTableComponent from '../components/SimpleTableComponent'
import { isCuradorOuOperador } from '../helpers/usuarios'

const { confirm } = Modal
const FormItem = Form.Item
const { Option } = Select

const columns = [
    {
        title: 'Subespécie',
        type: 'text',
        key: 'subespecie'
    },
    {
        title: 'Ação',
        key: 'acao'
    }
]

class ListaTaxonomiaSubespecie extends Component {
    constructor(props) {
        super(props)
        this.state = {
            especies: [],
            metadados: {},
            subespecies: [],
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
        axios.delete(`/subespecies/${id}`)
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 204) {
                    this.requisitaListaSubespecie(this.state.valores, this.state.pagina)
                    this.notificacao('success', 'Excluir', 'A Subespécie foi excluída com sucesso.')
                }
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
            title: 'Você tem certeza que deseja excluir esta subespécie?',
            content: 'Ao clicar em SIM, a subespécie será excluída.',
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
                        onClick={() => {
                            this.props.form.setFields({
                                nomeSubespecie: {
                                    value: item.nome
                                },
                                nomeEspecie: {
                                    value: item.especie_id
                                },
                                nomeAutor: {
                                    value: item.autor_id
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

    openNotificationWithIcon = (type, message, description) => {
        notification[type]({
            message,
            description
        })
    }

    formataDadosSubespecie = subespecies => subespecies.map(item => ({
        key: item.id,
        subespecie: item.nome,
        acao: this.gerarAcao(item)
    }))

    requisitaListaSubespecie = (valores, pg, pageSize) => {
        const params = {
            pagina: pg,
            limite: pageSize || 20
        }

        if (valores !== undefined) {
            const { subespecie } = valores

            if (subespecie) {
                params.subespecie = subespecie
            }
        }
        axios.get('/subespecies', { params })
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 200) {
                    const { data } = response
                    this.setState({
                        subespecies: this.formataDadosSubespecie(data.resultado),
                        metadados: data.metadados
                    })
                } else if (response.status === 400) {
                    this.notificacao('warning', 'Buscar', 'Erro ao buscar as subespécies.')
                } else {
                    this.notificacao('error', 'Error', 'Erro do servidor ao buscar as subespécies.')
                }
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

    requisitaAutores = () => {
        axios.get('/autores', {
            params: {
                limite: 9999999
            }
        })
            .then(response => {
                if (response.status === 200) {
                    this.setState({
                        autores: response.data.resultado
                    })
                } else {
                    this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao buscar os autores, tente novamente.')
                }
            })
            .catch(err => {
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
                    this.openNotificationWithIcon('success', 'Sucesso', 'O cadastro foi realizado com sucesso.')
                } else if (response.status === 400) {
                    this.openNotificationWithIcon('warning', 'Falha', response.data.error.message)
                } else {
                    this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao cadastrar a nova subespécie, tente novamente.')
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
        axios.put(`/subespecies/${this.state.id}`, {
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
                    this.openNotificationWithIcon('success', 'Sucesso', 'A atualização foi realizada com sucesso.')
                } else if (response.status === 400) {
                    this.openNotificationWithIcon('warning', 'Falha', response.data.error.message)
                } else {
                    this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao atualizar a subespécie, tente novamente.')
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

    requisitaEspecies = () => {
        axios.get('/especies', {
            params: {
                limite: 9999999
            }
        })
            .then(response => {
                if (response.status === 200) {
                    this.setState({
                        especies: response.data.resultado
                    })
                } else {
                    this.openNotificationWithIcon('error', 'Falha', 'Houve um problema ao buscar as espécies, tente novamente.')
                }
            })
            .catch(err => {
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
            <Card title="Buscar subespécie">
                <Form onSubmit={this.onSubmit}>
                    <Row gutter={8}>
                        <Col span={24}>
                            <span>Nome da subespécie:</span>
                        </Col>
                    </Row>
                    <Row gutter={8}>
                        <Col span={24}>
                            <FormItem>
                                {getFieldDecorator('subespecie')(
                                    <Input placeholder="A. comosus" type="text" />
                                )}
                            </FormItem>
                        </Col>
                    </Row>

                    <Row style={{ marginTop: 32 }}>
                        <Col span={24}>
                            <Row type="flex" justify="end" gutter={16}>
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

    optionEspecie = () => this.state.especies.map(item => (
        <Option value={item.id}>{item.nome}</Option>
    ))

    optionAutores = () => this.state.autores.map(item => (
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
                                if (this.props.form.getFieldsValue().nomeEspecie && this.props.form.getFieldsValue().nomeSubespecie && this.props.form.getFieldsValue().nomeSubespecie.trim() !== '') {
                                    this.cadastraNovaSubespecie()
                                } else {
                                    this.openNotificationWithIcon('warning', 'Falha', 'Informe o nome da nova subespécie e da espécie.')
                                }
                            } else if (this.props.form.getFieldsValue().nomeEspecie && this.props.form.getFieldsValue().nomeSubespecie && this.props.form.getFieldsValue().nomeSubespecie.trim() !== '') {
                                this.atualizaSubespecie()
                            } else {
                                this.openNotificationWithIcon('warning', 'Falha', 'Informe o nome da nova subespécie e da espécie.')
                            }
                            this.setState({
                                visibleModal: false
                            })
                        }}
                    >

                        <div>
                            <Row gutter={8}>
                                <Col span={24}>
                                    <span>Nome da espécie:</span>
                                </Col>
                            </Row>
                            <Row gutter={8}>
                                <Col span={24}>
                                    <FormItem>
                                        {getFieldDecorator('nomeEspecie')(
                                            <Select
                                                showSearch
                                                style={{ width: '100%' }}
                                                placeholder="Selecione uma espécie"
                                                optionFilterProp="children"
                                            >

                                                {this.optionEspecie()}
                                            </Select>
                                        )}
                                    </FormItem>
                                </Col>
                            </Row>
                            <Row gutter={8} style={{ marginTop: 16 }}>
                                <Col span={24}>
                                    <span>Nome da subespécie:</span>
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
                                <Col span={24}>
                                    <span>Nome do autor:</span>
                                </Col>
                            </Row>
                            <Row gutter={8}>
                                <Col span={24}>
                                    <FormItem>
                                        {getFieldDecorator('nomeAutor')(
                                            <Select
                                                showSearch
                                                style={{ width: '100%' }}
                                                placeholder="Selecione um autor"
                                                optionFilterProp="children"
                                            >

                                                {this.optionAutores()}
                                            </Select>
                                        )}
                                    </FormItem>
                                </Col>
                            </Row>
                        </div>

                    </ModalCadastroComponent>
                </Form>

                <Row gutter={24} style={{ marginBottom: '20px' }}>
                    <Col xs={24} sm={14} md={18} lg={20} xl={20}>
                        <h2 style={{ fontWeight: 200 }}>Subespécies</h2>
                    </Col>
                    <Col xs={24} sm={10} md={6} lg={4} xl={4}>
                        {this.renderAdd()}
                    </Col>
                </Row>

                <Divider dashed />
                {this.renderPainelBusca(getFieldDecorator)}
                <Divider dashed />
                <SimpleTableComponent
                    columns={columns}
                    data={this.state.subespecies}
                    metadados={this.state.metadados}
                    loading={this.state.loading}
                    changePage={(pg, pageSize) => {
                        this.setState({
                            pagina: pg,
                            loading: true
                        })
                        this.requisitaListaSubespecie(this.state.valores, pg, pageSize)
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
export default Form.create()(ListaTaxonomiaSubespecie)
