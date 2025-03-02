/* eslint-disable react/destructuring-assignment */
import { Component } from 'react'

import {
    Divider, Card, Row, Col,
    Input, Button, notification,
    Spin
} from 'antd'
import axios from 'axios'

import TotalRecordFound from '@/components/TotalRecordsFound'
import { formatarDataBDtoDataHora } from '@/helpers/conversoes/ConversoesData'
import { Form } from '@ant-design/compatible'
import { LoadingOutlined } from '@ant-design/icons'

import SimpleTableComponent from '../components/SimpleTableComponent'
import { isCuradorOuOperador } from '../helpers/usuarios'

const FormItem = Form.Item

const columns = [
    {
        title: 'Espécie',
        type: 'text',
        key: 'especie',
        dataIndex: 'especie',
        sorter: true,
        width: '46.5%'
    },
    {
        title: 'Tombos',
        type: 'text',
        key: 'tombos',
        dataIndex: 'tombos',
        sorter: true,
        width: '46.5%'
    }
]

class RelatorioInventarioEspeciesScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {
            dados: [],
            metadados: {},
            pagina: 1,
            loading: false,
            loadingExport: false
        }
    }

    componentDidMount() {
        const { pagina } = this.state
        this.requisitaDadosDoRelatorio({}, pagina)
    }

    notificacao = (type, titulo, descricao) => {
        notification[type]({
            message: titulo,
            description: descricao
        })
    }

    formataDadosDoRelatorio = dados => dados.map(item => ({
        key: item.id,
        especie: item.especie,
        tombos: item.tombos.join(', ')
    }))

    requisitaDadosDoRelatorio = (valores, pg, pageSize, sorter) => {
        const campo = sorter && sorter.field ? sorter.field : 'familia'
        const ordem = sorter && sorter.order === 'descend' ? 'desc' : 'asc'

        const params = {
            pagina: pg,
            limite: pageSize || 20,
            order: `${campo}:${ordem}`
        }

        if (valores !== undefined) {
            const { familia } = valores

            if (familia) {
                params.familia = familia
            }
        }
        axios.get('/relatorio/inventario-especies', { params })
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 200) {
                    const { data } = response
                    this.setState({
                        dados: this.formataDadosDoRelatorio(data.dados),
                        metadados: data.metadados
                    })
                } else if (response.status === 400) {
                    this.notificacao('warning', 'Buscar dados', 'Erro ao buscar os dados do relatório.')
                } else {
                    this.notificacao('error', 'Error', 'Erro de servidor ao buscar os dados do relatório.')
                }
            })
            .catch(err => {
                this.setState({
                    loading: false
                })
                const { response } = err
                if (response && response.data) {
                    const { error } = response.data
                    // eslint-disable-next-line no-console
                    console.error(error.message)
                }
            })
            .catch(this.catchRequestError)
    }

    requisitaExportarPDF = () => {
        this.setState({
            loadingExport: true
        })
        axios.post('/report', {
            template: {
                name: 'inventario-especies'
            },
            data: {
                data: formatarDataBDtoDataHora(new Date()),
                dados: [{
                    familia: this.state.valores.familia,
                    especies: this.state.dados
                }]
            }
        }, {
            responseType: 'blob'
        })
            .then(response => {
                if (response.status === 200) {
                    this.notificacao('success', 'Exportar PDF', 'PDF gerado com sucesso.')
                    const file = new Blob([response.data], { type: 'application/pdf' })
                    const fileUrl = URL.createObjectURL(file)
                    window.open(fileUrl)
                } else if (response.status === 400) {
                    this.notificacao('warning', 'Exportar PDF', 'Erro ao exportar o PDF.')
                } else {
                    this.notificacao('error', 'Error', 'Erro de servidor ao exportar o PDF.')
                }
            })
            .catch(err => {
                const { response } = err
                if (response && response.data) {
                    const { error } = response.data
                    // eslint-disable-next-line no-console
                    console.error(error.message)
                }
            })
            .catch(this.catchRequestError)
            .finally(() => {
                this.setState({
                    loadingExport: false
                })
            })
    }

    handleSubmit = (err, valores) => {
        if (!err) {
            this.setState({
                valores,
                loading: true
            })
            const { pagina, pageSize } = this.state
            this.requisitaDadosDoRelatorio(valores, pagina, pageSize)
        }
    }

    onSubmit = event => {
        event.preventDefault()
        const { form } = this.props
        form.validateFields(this.handleSubmit)
    }

    renderBotaoPDF() {
        return (
            <Button
                type="primary"
                className="login-form-button"
                onClick={() => this.requisitaExportarPDF()}
                disabled={this.state.loadingExport}
            >
                {this.state.loadingExport
                    ? <Spin indicator={<LoadingOutlined spin />} size="small" style={{ marginRight: 8 }} />
                    : ''}
                Gerar PDF
            </Button>
        )
    }

    renderPainelBusca() {
        const { form } = this.props
        const { getFieldDecorator } = form
        return (
            <Card title="Buscar família">
                <Form onSubmit={this.onSubmit}>
                    <Row gutter={8}>
                        <Col span={24}>
                            <span>Nome da família:</span>
                        </Col>
                    </Row>
                    <Row gutter={8}>
                        <Col span={24}>
                            <FormItem>
                                {getFieldDecorator('familia')(
                                    <Input placeholder="Passiflora edulis" type="text" />
                                )}
                            </FormItem>
                        </Col>
                    </Row>

                    <Row style={{ marginTop: 32 }}>
                        <Col span={24}>
                            <Row align="middle" type="flex" justify="end" gutter={16}>
                                <Col xs={24} sm={8} md={12} lg={16} xl={16}>
                                    <TotalRecordFound
                                        // eslint-disable-next-line react/destructuring-assignment
                                        total={this.state.metadados?.total}
                                    />
                                </Col>
                                <Col xs={24} sm={8} md={6} lg={4} xl={4}>
                                    <FormItem>
                                        <Button
                                            onClick={() => {
                                                const { form } = this.props
                                                form.resetFields()
                                                this.setState({
                                                    pagina: 1,
                                                    valores: {},
                                                    metadados: {}
                                                })
                                                this.requisitaListaFamilia({}, 1)
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

    renderFormulario() {
        const { form } = this.props
        const { getFieldDecorator } = form
        return (
            <div>
                <Row gutter={24} style={{ marginBottom: '20px' }}>
                    <Col xs={24} sm={14} md={18} lg={20} xl={20}>
                        <h2 style={{ fontWeight: 200 }}>Relatório de Inventário de Espécies</h2>
                    </Col>
                    <Col xs={24} sm={10} md={6} lg={4} xl={4}>
                        {this.renderBotaoPDF()}
                    </Col>
                </Row>

                <Divider dashed />
                {this.renderPainelBusca(getFieldDecorator)}
                <Divider dashed />

                <SimpleTableComponent
                    columns={isCuradorOuOperador() ? columns : columns.filter(column => column.key !== 'acao')}
                    data={this.state.dados}
                    metadados={this.state.metadados}
                    loading={this.state.loading}
                    changePage={(pg, pageSize, sorter) => {
                        this.setState({
                            pagina: pg,
                            loading: true
                        })
                        const { valores } = this.state
                        this.requisitaListaFamilia(valores, pg, pageSize, sorter)
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
export default Form.create()(RelatorioInventarioEspeciesScreen)
