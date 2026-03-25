import { Component } from 'react'

import {
    Divider, Modal, Card, Row, Col, Select, Input, Button, notification
} from 'antd'
import axios from 'axios'
import { Link } from 'react-router'

import TotalRecordFound from '@/components/TotalRecordsFound'
import { Form } from '@ant-design/compatible'
import { DeleteOutlined, SearchOutlined } from '@ant-design/icons'
import { withTranslation } from 'react-i18next'

import SimpleTableComponent from '../components/SimpleTableComponent'
import { formatarDataBDtoDataHora } from '../helpers/conversoes/ConversoesData'

const { confirm } = Modal
const FormItem = Form.Item
const { Option } = Select

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
                    this.notificacao('success', this.props.t('common:excluir'), this.props.t('listaPendenciasScreen:pendenciaExcluida'))
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
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this
        confirm({
            title: this.props.t('listaPendenciasScreen:confirmExcluirTitulo'),
            content: this.props.t('listaPendenciasScreen:confirmExcluirConteudo'),
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
        const { t } = this.props
        return (
            <Card title={t('listaPendenciasScreen:buscarPendencias')}>
                <Form onSubmit={this.onSubmit}>
                    <Row gutter={8}>
                        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                            <Col span={24}>
                                <span>{t('listaPendenciasScreen:nomeUsuario')}</span>
                            </Col>
                            <Col span={24}>
                                <FormItem>
                                    {getFieldDecorator('nome')(
                                        <Input placeholder={t('listaPendenciasScreen:placeholderNome')} type="text" />
                                    )}
                                </FormItem>
                            </Col>
                        </Col>
                        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                            <Col span={24}>
                                <span>{t('listaPendenciasScreen:status')}</span>
                            </Col>
                            <Col span={24}>
                                <FormItem>
                                    {getFieldDecorator('status')(
                                        <Select placeholder={t('listaPendenciasScreen:placeholderSelecione')} allowClear>
                                            <Option value="ESPERANDO">{t('listaPendenciasScreen:statusEsperando')}</Option>
                                            <Option value="APROVADO">{t('listaPendenciasScreen:statusAprovado')}</Option>
                                            <Option value="REPROVADO">{t('listaPendenciasScreen:statusReprovado')}</Option>
                                        </Select>
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
                                            {t('common:limpar')}
                                        </Button>
                                    </FormItem>
                                </Col>
                                <Col xs={24} sm={12} md={6} lg={4} xl={4}>
                                    <FormItem>
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            className="login-form-button ant-btn-pesquisar"
                                        >
                                            {t('common:pesquisar')}
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
        const { t } = this.props

        const columns = [
            {
                title: t('listaPendenciasScreen:colNumeroTombo'),
                type: 'text',
                key: 'hcf'
            },
            {
                title: t('listaPendenciasScreen:colNomeUsuario'),
                type: 'text',
                key: 'usuario'
            },
            {
                title: t('listaPendenciasScreen:colDataCriacao'),
                type: 'text',
                key: 'dataCriacao'
            },
            {
                title: t('listaPendenciasScreen:colStatus'),
                type: 'text',
                key: 'status'
            },
            {
                title: t('listaPendenciasScreen:colObservacao'),
                type: 'text',
                key: 'observacao'
            },
            {
                title: t('listaPendenciasScreen:colAcao'),
                key: 'acao'
            }
        ]

        return (
            <div>
                <Row gutter={24} style={{ marginBottom: '20px' }}>
                    <Col span={20}>
                        <h2 style={{ fontWeight: 200 }}>{t('listaPendenciasScreen:titulo')}</h2>
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

const ListaPendenciasScreenWithForm = Form.create()(ListaPendenciasScreen)

export default withTranslation()(ListaPendenciasScreenWithForm)
