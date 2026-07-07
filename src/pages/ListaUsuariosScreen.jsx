import { Component } from 'react'

import {
    Divider, Modal, Card, Row, Col,
    Select, Input, Button, notification
} from 'antd'
import axios from 'axios'
import { withTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import TotalRecordFound from '@/components/TotalRecordsFound'
import { Form } from '@ant-design/compatible'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'

import HeaderListComponent from '../components/HeaderListComponent'
import SimpleTableComponent from '../components/SimpleTableComponent'
import { formatarDataBDtoDataHora } from '../helpers/conversoes/ConversoesData'
import { telefoneToFrontEnd } from '../helpers/conversoes/ConversoesTelefone'

const { confirm } = Modal
const FormItem = Form.Item
const { Option } = Select

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

    getColumns() {
        return [
            { title: this.props.t('listaUsuariosScreen:colunaNome'), type: 'text', key: 'nome', width: 300 },
            { title: this.props.t('listaUsuariosScreen:colunaTipo'), type: 'text', key: 'tipo', width: 300 },
            { title: this.props.t('listaUsuariosScreen:colunaEmail'), type: 'text', key: 'email', width: 300 },
            { title: this.props.t('listaUsuariosScreen:colunaTelefone'), type: 'text', key: 'telefone', width: 300 },
            { title: this.props.t('listaUsuariosScreen:colunaDataCriacao'), type: 'text', key: 'dataCriacao', width: 300 },
            { title: this.props.t('listaUsuariosScreen:colunaAcao'), key: 'acao', width: 100 }
        ]
    }

    requisitaExclusao(id) {
        this.setState({
            loading: true
        })
        axios.delete(`/usuarios/${id}`)
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 204) {
                    this.requisitaListaUsuarios(this.state.valores, this.state.pagina)
                    this.notificacao('success', this.props.t('common:excluir'), this.props.t('listaUsuariosScreen:sucessoExcluirUsuario'))
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
                        this.notificacao('error', this.props.t('listaUsuariosScreen:erroExcluirUsuario'), error.code)
                    } else {
                        this.notificacao('error', this.props.t('listaUsuariosScreen:erroExcluirUsuario'), this.props.t('listaUsuariosScreen:erroInesperadoExcluirUsuario'))
                    }
                    console.error(error)
                } else {
                    this.notificacao('error', this.props.t('listaUsuariosScreen:erroExcluirUsuario'), this.props.t('common:erroComunicacaoServidor'))
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
            title: this.props.t('listaUsuariosScreen:confirmarExcluirUsuario'),
            content: this.props.t('listaUsuariosScreen:descricaoExcluirUsuario'),
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
            <Card title={this.props.t('listaUsuariosScreen:buscarUsuario')}>
                <Form onSubmit={this.onSubmit}>
                    <Row gutter={8}>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <span>{this.props.t('listaUsuariosScreen:buscarNome')}</span>
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
                                <span>{this.props.t('listaUsuariosScreen:buscarEmail')}</span>
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
                                <span>{this.props.t('listaUsuariosScreen:buscarTipo')}</span>
                            </Col>
                            <Col span={24}>
                                <FormItem>
                                    {getFieldDecorator('tipo')(
                                        <Select placeholder={this.props.t('listaUsuariosScreen:selecioneTipo')} allowClear>
                                            <Option value="1">{this.props.t('listaUsuariosScreen:tipoCurador')}</Option>
                                            <Option value="2">{this.props.t('listaUsuariosScreen:tipoOperador')}</Option>
                                            <Option value="3">{this.props.t('listaUsuariosScreen:tipoIdentificador')}</Option>
                                        </Select>
                                    )}
                                </FormItem>
                            </Col>
                        </Col>
                    </Row>
                    <Row gutter={8}>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <span>{this.props.t('listaUsuariosScreen:buscarTelefone')}</span>
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
                                                this.requisitaListaUsuarios({}, 1)
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

    render() {
        const { getFieldDecorator } = this.props.form
        return (
            <div>
                <HeaderListComponent title={this.props.t('listaUsuariosScreen:titulo')} link="/usuarios/novo" />
                <Divider dashed />
                {this.renderPainelBusca(getFieldDecorator)}
                <Divider dashed />
                <SimpleTableComponent
                    columns={this.getColumns()}
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

export default withTranslation()(Form.create()(ListaUsuariosScreen))
