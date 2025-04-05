/* eslint-disable react/destructuring-assignment */
import { Component } from 'react'

import {
    Divider, Card, Row, Col,
    Button, notification,
    Spin,
    Select
} from 'antd'
import axios from 'axios'

import TableCollapse from '@/components/TableCollapse'
import TotalRecordFound from '@/components/TotalRecordsFound'
import { formatarDataBDtoDataHora } from '@/helpers/conversoes/ConversoesData'
import { Form } from '@ant-design/compatible'
import { LoadingOutlined } from '@ant-design/icons'

const FormItem = Form.Item
const { Option } = Select

class RelatorioInventarioEspeciesScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {
            dados: [],
            metadados: {},
            pagina: 1,
            loading: false,
            loadingExport: false,
            familia: null,
            familias: []
        }
    }

    componentDidMount() {
        const { pagina } = this.state
        this.requisitaDadosDoRelatorio({}, pagina, null, null, true)
        this.requisitaFamilias()
    }

    notificacao = (type, titulo, descricao) => {
        notification[type]({
            message: titulo,
            description: descricao
        })
    }

    formataDadosDoRelatorio = dados => {
        return dados
    }

    requisitaDadosDoRelatorio = (valores, pg, pageSize, sorter, paraTabela) => {
        const params = {
            pagina: pg,
            limite: pageSize || 100,
            paraTabela
        }

        if (valores !== undefined) {
            const { familia } = valores
            this.setState({
                familia
            })

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
                        dados: this.formataDadosDoRelatorio(data.resultado),
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

    requisitaExportarPDF = async () => {
        this.setState({
            loadingExport: true
        })
        const params = {}

        if (this.state.familia !== undefined || this.state.familia !== null) {
            const { familia } = this.state

            if (familia) {
                params.familia = familia
            }
        }
        await axios.post('/relatorio/inventario-especies', { params }, {
            responseType: 'blob'
        }).then(response => {
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

    requisitaFamilias = () => {
        axios.get('/familias', {
            params: {
                limite: 9999999
            }
        })
            .then(response => {
                if (response.status === 200) {
                    this.setState({
                        familias: response.data.resultado
                    })
                }
            })
            .catch(err => {
                const { response } = err
                if (response && response.data) {
                    const { error } = response.data
                }
            })
            .catch(this.catchRequestError)
    }

    optionFamilia = () => this.state.familias.map(item => (
        <Option value={item.nome}>{item.nome}</Option>
    ))

    handleSubmit = (err, valores) => {
        if (!err) {
            this.setState({
                loading: true
            })
            const { pagina, pageSize } = this.state
            this.requisitaDadosDoRelatorio(valores, pagina, pageSize, null, true)
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
                                    <Select
                                        showSearch
                                        style={{ width: '100%' }}
                                        placeholder="Selecione uma família"
                                        optionFilterProp="children"
                                    >

                                        {this.optionFamilia()}
                                    </Select>
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
                                                    metadados: {},
                                                    familia: null
                                                })
                                                this.requisitaDadosDoRelatorio({}, 1, null, null, true)
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

                <p>Clique no nome da família para exibir suas informações</p>
                <TableCollapse data={this.state.dados} loading={this.state.loading} />
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
