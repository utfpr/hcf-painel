import { Component } from 'react'

import {
    Divider, Modal, Card, Row, Col,
    Select, Input, Button, notification
} from 'antd'
import axios from 'axios'
import { Link } from 'react-router-dom'

import { Form } from '@ant-design/compatible'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'

import HeaderListComponent from '../components/HeaderListComponent'
import SimpleTableComponent from '../components/SimpleTableComponent'
import { formatarDataBDtoDataHora } from '../helpers/conversoes/ConversoesData'
import { telefoneToFrontEnd } from '../helpers/conversoes/ConversoesTelefone'

const { confirm } = Modal
const FormItem = Form.Item
const { Option } = Select

const columns = [
    {
        title: 'Nome',
        type: 'text',
        key: 'nome'
    },
    {
        title: 'Tipo',
        type: 'text',
        key: 'tipo'
    },
    {
        title: 'E-mail',
        type: 'text',
        key: 'email'
    },
    {
        title: 'Telefone',
        type: 'text',
        key: 'telefone'
    },
    {
        title: 'Data de criação',
        type: 'text',
        key: 'dataCriacao'
    },
    {
        title: 'Ação',
        key: 'acao'
    }

]

class ListaUsuariosScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {
            usuarios: [],
            metadados: {},
            loading: true,
            pagina: 1
        }
    }

    requisitaExclusao(id) {
        axios.delete(`/usuarios/${id}`)
            .then(response => {
                if (response.status === 204) {
                    this.requisitaListaUsuarios(this.state.valores, this.state.pagina)
                    this.notificacao('success', 'Excluir usuário', 'O usuário foi excluído com sucesso.')
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
            title: 'Você tem certeza que deseja excluir este usuário?',
            content: 'Ao clicar em SIM, o usuário será excluído.',
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
        this.requisitaListaUsuarios({}, this.state.pagina)
    }

    gerarAcao(id) {
        return (
            <span>
                <Link to={`/usuarios/${id}`}>
                    <EditOutlined style={{ color: '#FFCC00' }} />
                </Link>
                <Divider type="vertical" />
                <a href="#" onClick={() => this.mostraMensagemDelete(id)}>
                    <DeleteOutlined style={{ color: '#e30613' }} />
                </a>
            </span>
        )
    }

    formataDadosUsuario = usuarios => usuarios.map(item => ({
        key: item.id,
        nome: item.nome,
        email: item.email,
        ra: item.ra,
        herbario_id: item.herbario_id,
        tipo: item.tipos_usuario.tipo.toLowerCase(),
        tipo_id: item.tipos_usuario.id,
        telefone: telefoneToFrontEnd(item.telefone),
        dataCriacao: formatarDataBDtoDataHora(item.tipos_usuario.created_at),
        acao: this.gerarAcao(item.id)
    }))

    requisitaListaUsuarios = (valores, pg, pageSize) => {
        const params = {
            pagina: pg,
            limite: pageSize || 20
        }

        if (valores !== undefined) {
            const {
                nome, email, tipo, telefone
            } = valores

            if (nome) {
                params.nome = nome
            }
            if (email) {
                params.email = email
            }
            if (tipo) {
                params.tipo = tipo
            }
            if (telefone) {
                params.telefone = telefone
            }
        }
        axios.get('/usuarios', { params })
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 200) {
                    const { data } = response
                    this.setState({
                        usuarios: this.formataDadosUsuario(data.usuarios),
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
            this.requisitaListaUsuarios(valores, this.state.pagina)
        }
    }

    onSubmit = event => {
        event.preventDefault()
        this.props.form.validateFields(this.handleSubmit)
    }

    renderPainelBusca(getFieldDecorator) {
        return (
            <Card title="Buscar usuário">
                <Form onSubmit={this.onSubmit}>
                    <Row gutter={8}>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <span>Nome:</span>
                            </Col>
                            <Col span={24}>
                                <FormItem>
                                    {getFieldDecorator('nome')(
                                        <Input placeholder="Marcelo Caxambu" type="text" />
                                    )}
                                </FormItem>
                            </Col>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <span>E-mail:</span>
                            </Col>
                            <Col span={24}>
                                <FormItem>
                                    {getFieldDecorator('email')(
                                        <Input placeholder="marcelo@gmail.com" type="email" />
                                    )}
                                </FormItem>
                            </Col>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <span>Tipo:</span>
                            </Col>
                            <Col span={24}>
                                <FormItem>
                                    {getFieldDecorator('tipo')(
                                        <Select initialValue="2">
                                            <Option value="1">Curador</Option>
                                            <Option value="2">Operador</Option>
                                            <Option value="3">Identificador</Option>
                                        </Select>
                                    )}
                                </FormItem>
                            </Col>
                        </Col>
                    </Row>
                    <Row gutter={8}>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <span>Telefone:</span>
                            </Col>
                            <Col span={24}>
                                <FormItem>
                                    {getFieldDecorator('telefone')(
                                        <Input placeholder="+5544999682514" type="phone" />
                                    )}
                                </FormItem>
                            </Col>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>
                            <Row align="middle" type="flex" justify="end" gutter={16}>
                                <Col xs={24} sm={8} md={12} lg={16} xl={16}>
                                    Foram encontrados
                                    {' '}
                                    {this.state.metadados?.total || 0}
                                    {' '}
                                    registros.
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
                                                this.requisitaListaUsuarios({}, 1)
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

    render() {
        const { getFieldDecorator } = this.props.form
        return (
            <div>
                <HeaderListComponent title="Listagem de usuários" link="/usuarios/novo" />
                <Divider dashed />
                {this.renderPainelBusca(getFieldDecorator)}
                <Divider dashed />
                <SimpleTableComponent
                    columns={columns}
                    data={this.state.usuarios}
                    metadados={this.state.metadados}
                    loading={this.state.loading}
                    changePage={(pg, pageSize) => {
                        this.setState({
                            pagina: pg,
                            loading: true
                        })
                        this.requisitaListaUsuarios(this.state.valores, pg, pageSize)
                    }}
                />
                <Divider dashed />
            </div>
        )
    }
}

export default Form.create()(ListaUsuariosScreen)
