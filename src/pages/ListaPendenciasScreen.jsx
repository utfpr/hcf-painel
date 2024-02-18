import { Component } from 'react'

import {
    Divider, Modal, Card, Row, Col, Select, Input, Button, notification
} from 'antd'
import axios from 'axios'
import { Link } from 'react-router-dom'

import { Form } from '@ant-design/compatible'
import { DeleteOutlined, SearchOutlined } from '@ant-design/icons'

import SimpleTableComponent from '../components/SimpleTableComponent'
import { formatarDataBDtoDataHora } from '../helpers/conversoes/ConversoesData'

const { confirm } = Modal
const FormItem = Form.Item
const { Option } = Select

const columns = [
    {
        title: 'Nº Tombo',
        type: 'text',
        key: 'hcf'
    },
    {
        title: 'Nome usuário',
        type: 'text',
        key: 'usuario'
    },
    {
        title: 'Data de criação',
        type: 'text',
        key: 'dataCriacao'
    },
    {
        title: 'Status',
        type: 'text',
        key: 'status'
    },
    {
        title: 'Observação',
        type: 'text',
        key: 'observacao'
    },
    {
        title: 'Ação',
        key: 'acao'
    }

]

class ListaPendenciasScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {
            pendencias: [],
            metadados: {},
            loading: true,
            pagina: 1
        }
    }

    requisitaExclusao(id) {
        axios.delete(`/pendencias/${id}`)
            .then(response => {
                if (response.status === 204) {
                    this.requisitaListaPendencias(this.state.valores, this.state.pagina)
                    this.notificacao('success', 'Excluir', 'A pendência foi excluída com sucesso.')
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

    notificacao = (type, titulo, descricao) => {
        notification[type]({
            message: titulo,
            description: descricao
        })
    }

    mostraMensagemDelete(id) {
        const self = this
        confirm({
            title: 'Você tem certeza que deseja excluir esta pendência?',
            content: 'Ao clicar em SIM, a pendência será excluída.',
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
        this.requisitaListaPendencias({}, this.state.pagina)
    }

    gerarAcao(id) {
        return (
            <span>
                <Link to={`/pendencias/${id}`}>
                    <SearchOutlined />
                </Link>
                <Divider type="vertical" />
                <a href="#" onClick={() => this.mostraMensagemDelete(id)}>
                    <DeleteOutlined style={{ color: '#e30613' }} />
                </a>
            </span>
        )
    }

    formataDadosPendencia = pendencias => pendencias.map(item => ({
        key: item.id,
        hcf: item.numero_tombo,
        usuario: item.nome_usuario,
        status: item.status,
        dataCriacao: formatarDataBDtoDataHora(item.data_criacao),
        observacao: item.observacao || '',
        acao: this.gerarAcao(item.id)
    }))

    requisitaListaPendencias = (valores, pg) => {
        const params = {
            pagina: pg
        }

        if (valores !== undefined) {
            const { nome, status } = valores

            if (nome) {
                params.nome_usuario = nome
            }
            if (status) {
                params.status = status.toUpperCase()
            }
        }
        axios.get('/pendencias', { params })
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 200) {
                    const { data } = response
                    this.setState({
                        pendencias: this.formataDadosPendencia(data.resultado),
                        metadados: data.metadados
                    })
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
            this.requisitaListaPendencias(valores, this.state.pagina)
        }
    }

    onSubmit = event => {
        event.preventDefault()
        this.props.form.validateFields(this.handleSubmit)
    }

    renderPainelBusca(getFieldDecorator) {
        return (
            <Card title="Buscar pendências">
                <Form onSubmit={this.onSubmit}>
                    <Row gutter={8}>
                        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                            <Col span={24}>
                                <span>Nome de usuário:</span>
                            </Col>
                            <Col span={24}>
                                <FormItem>
                                    {getFieldDecorator('nome')(
                                        <Input placeholder="Marcelo Caxambu" type="text" />
                                    )}
                                </FormItem>
                            </Col>
                        </Col>
                        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                            <Col span={24}>
                                <span>Status:</span>
                            </Col>
                            <Col span={24}>
                                <FormItem>
                                    {getFieldDecorator('status')(
                                        <Select initialValue="2">
                                            <Option value="ESPERANDO">Esperando</Option>
                                            <Option value="APROVADO">Aprovado</Option>
                                            <Option value="REPROVADO">Reprovado</Option>
                                        </Select>
                                    )}
                                </FormItem>
                            </Col>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>
                            <Row type="flex" justify="end" gutter={4}>
                                <Col xs={24} sm={12} md={6} lg={4} xl={4}>
                                    <FormItem>
                                        <Button
                                            onClick={() => {
                                                this.props.form.resetFields()
                                                this.setState({
                                                    pagina: 1,
                                                    valores: {},
                                                    metadados: {},
                                                    pendencias: []
                                                })
                                                this.requisitaListaPendencias({}, 1)
                                            }}
                                            className="login-form-button"
                                        >
                                            Limpar
                                        </Button>
                                    </FormItem>
                                </Col>
                                <Col xs={24} sm={12} md={6} lg={4} xl={4}>
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

    render() {
        const { getFieldDecorator } = this.props.form
        return (
            <div>
                <Row gutter={24} style={{ marginBottom: '20px' }}>
                    <Col span={20}>
                        <h2 style={{ fontWeight: 200 }}>Listagem de pendências</h2>
                    </Col>
                </Row>
                <Divider dashed />
                {this.renderPainelBusca(getFieldDecorator)}
                <Divider dashed />
                <SimpleTableComponent
                    columns={columns}
                    data={this.state.pendencias}
                    metadados={this.state.metadados}
                    loading={this.state.loading}
                    changePage={pg => {
                        this.setState({
                            pagina: pg,
                            loading: true
                        })
                        this.requisitaListaPendencias(this.state.valores, pg)
                    }}
                />
                <Divider dashed />
            </div>
        )
    }
}

export default Form.create()(ListaPendenciasScreen)
