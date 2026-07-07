import { Component } from 'react'

import {
    Divider, Modal, Card, Row, Col, Input, Button, notification
} from 'antd'
import axios from 'axios'
import { withTranslation } from 'react-i18next'
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
    constructor(props) {
        super(props)
        this.state = {
            herbarios: [],
            metadados: {},
            loading: true,
            pagina: 1
        }
    }

    getColumns() {
        const columns = [
            {
                title: this.props.t('listaIdentificadoresScreen:colunaNome'),
                type: 'text',
                key: 'nome'
            }
        ]

        if (isCuradorOuOperador()) {
            columns.push({
                title: this.props.t('listaIdentificadoresScreen:colunaAcao'),
                key: 'acao'
            })
        }

        return columns
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
                    this.notificacao('success', this.props.t('common:excluir'), this.props.t('listaIdentificadoresScreen:sucessoExcluirIdentificador'))
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
                        this.notificacao('error', this.props.t('listaIdentificadoresScreen:erroExcluirIdentificador'), error.code)
                    } else {
                        this.notificacao('error', this.props.t('listaIdentificadoresScreen:erroExcluirIdentificador'), this.props.t('listaIdentificadoresScreen:erroInesperadoExcluirIdentificador'))
                    }
                    console.error(error)
                } else {
                    this.notificacao('error', this.props.t('listaIdentificadoresScreen:erroExcluirIdentificador'), this.props.t('common:erroComunicacaoServidor'))
                }
            })
    }

    mostraMensagemDelete(id) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this
        confirm({
            title: this.props.t('listaIdentificadoresScreen:confirmarExcluirIdentificador'),
            content: this.props.t('listaIdentificadoresScreen:descricaoExcluirIdentificador'),
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
            <Card title={this.props.t('listaIdentificadoresScreen:buscarIdentificador')}>
                <Form onSubmit={this.onSubmit}>
                    <Row gutter={8}>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <span>{this.props.t('listaIdentificadoresScreen:buscarNome')}</span>
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
                <HeaderListComponent title={this.props.t('listaIdentificadoresScreen:titulo')} link="/identificadores/novo" />
                <Divider dashed />
                {this.renderPainelBusca(getFieldDecorator)}
                <Divider dashed />
                <SimpleTableComponent
                    columns={this.getColumns()}
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

export default withTranslation()(Form.create()(ListaIdentificadoresScreen))
