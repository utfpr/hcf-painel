import { Component } from 'react'

import {
    Divider, Modal, Card, Row, Col, Input, Button, notification
} from 'antd'
import axios from 'axios'
import { Link } from 'react-router-dom'

import TotalRecordFound from '@/components/TotalRecordsFound'
import { Form } from '@ant-design/compatible'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'

import HeaderListComponent from '../components/HeaderListComponent'
import SimpleTableComponent from '../components/SimpleTableComponent'
import { isCuradorOuOperador } from '../helpers/usuarios'

const { confirm } = Modal
const FormItem = Form.Item

class ListaIdentificadoresScreen extends Component {
    columns = [
        {
            title: 'Nome',
            type: 'text',
            key: 'nome'
        }
    ]

    constructor(props) {
        super(props)
        this.state = {
            herbarios: [],
            metadados: {},
            loading: true,
            pagina: 1
        }

        if (isCuradorOuOperador()) {
            this.columns.push({
                title: 'Ação',
                key: 'acao'
            })
        }
    }

    componentDidMount() {
        this.requisitaListaIdentificadores({}, this.state.pagina)
    }

    gerarAcao = id => {
        if (isCuradorOuOperador()) {
            return (
                <span>
                    <Link to={`/identificadores/${id}`}>
                        <EditOutlined style={{ color: '#FFCC00' }} />
                    </Link>
                    <Divider type="vertical" />
                    <a href="#" onClick={() => this.mostraMensagemDelete(id)}>
                        <DeleteOutlined style={{ color: '#e30613' }} />
                    </a>
                </span>
            )
        }
    }

    requisitaExclusao(id) {
        this.setState({
            loading: true
        })
        axios.delete(`/identificadores/${id}`)
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 204) {
                    this.requisitaListaIdentificadores(this.state.valores, this.state.pagina)
                    this.notificacao('success', 'Excluir', 'O identificador foi excluído com sucesso.')
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
                        this.notificacao('error', 'Erro ao excluir identificador', error.code)
                    } else {
                        this.notificacao('error', 'Erro ao excluir identificador', 'Ocorreu um erro inesperado ao tentar excluir o identificador.')
                    }
                    console.error(error)
                } else {
                    this.notificacao('error', 'Erro ao excluir identificador', 'Falha na comunicação com o servidor.')
                }
            })
    }

    mostraMensagemDelete(id) {
        const self = this
        confirm({
            title: 'Você tem certeza que deseja excluir este identificador?',
            content: 'Ao clicar em SIM, o identificador será excluído.',
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

    notificacao = (type, titulo, descricao) => {
        notification[type]({
            message: titulo,
            description: descricao
        })
    }

    formataDadosIdentificadores = identificadores => identificadores.map(item => ({
        key: item.id,
        nome: item.nome,
        acao: this.gerarAcao(item.id)
    }))

    requisitaListaIdentificadores = async (valores, pg, pageSize) => {
        const params = {
            pagina: pg,
            limite: pageSize
        }

        if (valores && valores.nome) {
            params.nome = valores.nome
        }

        try {
            const { data } = await axios.get('/identificadores', { params })

            this.setState({
                herbarios: this.formataDadosIdentificadores(data.identificadores),
                metadados: data.metadados,
                loading: false
            })
        } catch (err) {
            this.setState({ loading: false })
        }
    }

    handleSubmit = (err, valores) => {
        if (!err) {
            this.setState({
                valores,
                loading: true
            })
            this.requisitaListaIdentificadores(valores, this.state.pagina)
        }
    }

    onSubmit = event => {
        event.preventDefault()
        this.props.form.validateFields(this.handleSubmit)
    }

    renderPainelBusca(getFieldDecorator) {
        return (
            <Card title="Buscar identificador">
                <Form onSubmit={this.onSubmit}>
                    <Row gutter={8}>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <span>Nome:</span>
                            </Col>
                            <Col span={24}>
                                <FormItem>
                                    {getFieldDecorator('nome')(
                                        <Input placeholder="D. Zappi" type="text" />
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
                                                    herbarios: []
                                                })
                                                this.requisitaListaIdentificadores({}, 1)
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
                <HeaderListComponent title="Listagem de identificadores" link="/identificadores/novo" />
                <Divider dashed />
                {this.renderPainelBusca(getFieldDecorator)}
                <Divider dashed />
                <SimpleTableComponent
                    columns={this.columns}
                    data={this.state.herbarios}
                    metadados={this.state.metadados}
                    loading={this.state.loading}
                    changePage={(pg, pageSize) => {
                        this.setState({
                            pagina: pg,
                            loading: true
                        })
                        this.requisitaListaIdentificadores(this.state.valores, pg, pageSize)
                    }}
                />
                <Divider dashed />
            </div>
        )
    }
}

export default Form.create()(ListaIdentificadoresScreen)
