import { Component } from 'react'

import {
    Divider, Modal, Card, Row, Col, Input, Button, notification
} from 'antd'
import axios from 'axios'
import { withTranslation } from 'react-i18next'
import { Link } from 'react-router'

import TotalRecordFound from '@/components/TotalRecordsFound'
import { Form } from '@ant-design/compatible'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'

import HeaderListComponent from '../components/HeaderListComponent'
import SimpleTableComponent from '../components/SimpleTableComponent'
import { isCuradorOuOperador } from '../helpers/usuarios'

const { confirm } = Modal
const FormItem = Form.Item

class ListaHerbariosScreen extends Component {
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
                title: this.props.t('listaHerbariosScreen:colunaSigla'),
                type: 'text',
                key: 'sigla',
                width: 100
            },
            {
                title: this.props.t('listaHerbariosScreen:colunaNome'),
                type: 'text',
                key: 'nome',
                width: 400
            },
            {
                title: this.props.t('listaHerbariosScreen:colunaEndereco'),
                type: 'text',
                key: 'endereco',
                width: 400
            },
            {
                title: this.props.t('listaHerbariosScreen:colunaEmail'),
                type: 'text',
                key: 'email',
                width: 400
            }
        ]

        if (isCuradorOuOperador()) {
            columns.push({
                title: this.props.t('listaHerbariosScreen:colunaAcao'),
                key: 'acao'
            })
        }

        return columns
    }

    componentDidMount() {
        this.requisitaListaHerbarios({}, this.state.pagina)
    }

    gerarAcao = id => {
        if (isCuradorOuOperador()) {
            return (
                <span>
                    <Link to={`/herbarios/${id}`}>
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

    notificacao = (type, titulo, descricao) => {
        notification[type]({
            message: titulo,
            description: descricao
        })
    }

    requisitaExclusao(id) {
        this.setState({
            loading: true
        })
        axios.delete(`/herbarios/${id}`)
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 204) {
                    this.requisitaListaHerbarios(this.state.valores, this.state.pagina)
                    this.notificacao('success', this.props.t('common:excluir'), this.props.t('listaHerbariosScreen:sucessoExcluirHerbario'))
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
                        this.notificacao('error', this.props.t('listaHerbariosScreen:erroExcluirHerbario'), error.code)
                    } else {
                        this.notificacao('error', this.props.t('listaHerbariosScreen:erroExcluirHerbario'), this.props.t('listaHerbariosScreen:erroInesperadoExcluirHerbario'))
                    }
                    console.error(error)
                } else {
                    this.notificacao('error', this.props.t('listaHerbariosScreen:erroExcluirHerbario'), this.props.t('common:erroComunicacaoServidor'))
                }
            })
    }

    retornaEndereco(endereco) {
        let retorno = ''
        if (endereco !== null && endereco !== '') {
            if (endereco.logradouro != null) {
                retorno += endereco.logradouro
            }
            if (endereco.numero != null) {
                retorno += ` ${endereco.numero},`
            }
            if (endereco.cidade != null) {
                retorno += ` ${endereco.cidade.nome} -`
            }
            if (endereco.cidade != null && endereco.cidade.estado != null) {
                retorno += ` ${endereco.cidade.estado.nome}, `
            }
            if (endereco.cidade != null && endereco.cidade.estado != null) {
                retorno += ` ${endereco.cidade.estado.paise.nome} `
            }
            return retorno
        }
        return ''
    }

    formataDadosHerbarios = herbarios => herbarios.map(item => ({
        key: item.id,
        nome: item.nome,
        email: item.email === null ? '' : item.email,
        sigla: item.sigla,
        endereco: this.retornaEndereco(item.endereco),
        acao: this.gerarAcao(item.id)
    }))

    mostraMensagemDelete(id) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this
        confirm({
            title: this.props.t('listaHerbariosScreen:confirmarExcluirHerbario'),
            content: this.props.t('listaHerbariosScreen:descricaoExcluirHerbario'),
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

    requisitaListaHerbarios = (valores, pg, pageSize) => {
        const params = {
            pagina: pg,
            limite: pageSize
        }

        if (valores !== undefined) {
            const { nome, email, sigla } = valores

            if (nome) {
                params.nome = nome
            }
            if (email) {
                params.email = email
            }
            if (sigla) {
                params.sigla = sigla
            }
        }

        axios.get('/herbarios', { params })
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 200) {
                    const { data } = response
                    this.setState({
                        herbarios: this.formataDadosHerbarios(data.herbarios),
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
                    if (response.status === 400 || response.status === 422) {
                        this.notificacao('warning', this.props.t('common:tituloFalha'), response.data.error.message)
                    } else {
                        this.notificacao('error', this.props.t('common:tituloFalha'), this.props.t('listaHerbariosScreen:erroBuscarHerbarios'))
                    }
                    const { error } = response.data
                    console.error(error.message)
                }
            })
    }

    handleSubmit = (err, valores) => {
        if (!err) {
            if (valores.nome || valores.sigla || valores.email) {
                this.setState({
                    valores,
                    loading: true
                })
                this.requisitaListaHerbarios(valores, this.state.pagina)
            } else {
                this.notificacao('warning', this.props.t('common:pesquisar'), this.props.t('listaHerbariosScreen:validacaoBusca'))
            }
        }
    }

    onSubmit = event => {
        event.preventDefault()
        this.props.form.validateFields(this.handleSubmit)
    }

    renderPainelBusca(getFieldDecorator) {
        return (
            <Card title={this.props.t('listaHerbariosScreen:buscarHerbario')}>
                <Form onSubmit={this.onSubmit}>
                    <Row gutter={8}>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <span>{this.props.t('listaHerbariosScreen:buscarSigla')}</span>
                            </Col>
                            <Col span={24}>
                                <FormItem>
                                    {getFieldDecorator('sigla')(
                                        <Input placeholder="HCF" type="text" />
                                    )}
                                </FormItem>
                            </Col>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <span>{this.props.t('listaHerbariosScreen:buscarNome')}</span>
                            </Col>
                            <Col span={24}>
                                <FormItem>
                                    {getFieldDecorator('nome')(
                                        <Input placeholder="Herbario do Centro Federal" type="text" />
                                    )}
                                </FormItem>
                            </Col>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <span>{this.props.t('listaHerbariosScreen:buscarEmail')}</span>
                            </Col>
                            <Col span={24}>
                                <FormItem>
                                    {getFieldDecorator('email')(
                                        <Input placeholder="herbariofederal@gmail.com" type="text" />
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
                                                this.requisitaListaHerbarios({}, 1)
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
                <HeaderListComponent title={this.props.t('listaHerbariosScreen:titulo')} link="/herbarios/novo" />
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
                        this.requisitaListaHerbarios(this.state.valores, pg, pageSize)
                    }}
                />
                <Divider dashed />
            </div>
        )
    }
}

export default withTranslation()(Form.create()(ListaHerbariosScreen))
