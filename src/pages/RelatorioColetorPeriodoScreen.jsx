/* eslint-disable react/destructuring-assignment */
import { Component } from 'react'

import {
    Divider, Card, Row, Col,
    Button, notification,
    Spin,
    Input,
    DatePicker
} from 'antd'
import ptbr from 'antd/es/date-picker/locale/pt_BR'
import axios from 'axios'
import moment from 'moment'

import TableColetaPorLocalData from '@/components/TableColetaPorLocalData'
import TotalRecordFound from '@/components/TotalRecordsFound'
import { Form } from '@ant-design/compatible'
import { LoadingOutlined } from '@ant-design/icons'

const FormItem = Form.Item
const { RangePicker } = DatePicker

const dateFormat = 'DD/MM/YYYY'
const dateLocale = {
    ...ptbr,
    lang: {
        ...ptbr.lang
    }
}

class RelatorioColetorPeriodoScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {
            dados: [],
            metadados: {},
            pagina: 1,
            loading: false,
            loadingExport: false,
            loadingExport2: false,
            loadingExportNovo: false,
            dataInicio: moment().startOf('month')
                .toISOString(),
            dataFim: moment().endOf('day')
                .toISOString(),
            coletor: null
        }
    }

    componentDidMount() {
        const { pagina } = this.state
        this.requisitaDadosDoRelatorio({}, pagina, null, null, true)
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
            const { coletor, intervaloData } = valores

            if (coletor) {
                params.coletor = coletor
                this.setState({
                    coletor
                })
            }
            if (intervaloData && intervaloData.length > 0) {
                params.dataInicio = intervaloData[0].toISOString()
                params.dataFim = intervaloData[1].toISOString()
                this.setState({
                    dataInicio: intervaloData[0].toISOString(),
                    dataFim: intervaloData[1].toISOString()
                })
            } else {
                params.dataInicio = moment().startOf('month')
                    .toISOString()
                params.dataFim = moment().endOf('day')
                    .toISOString()
            }
        }
        axios.get('/relatorio/coleta-por-coletor-intervalo-de-data', { params })
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

    requisitaExportarPDF = async (sintetico, modeloNovo = false) => {
        if (sintetico) {
            this.setState({
                loadingExport: true
            })
        } else if (modeloNovo) {
            this.setState({
                loadingExportNovo: true
            })
        } else {
            this.setState({
                loadingExport2: true
            })
        }
        const params = {}

        if (this.state.coletor !== undefined || this.state.coletor !== null) {
            const { coletor } = this.state

            if (coletor) {
                params.coletor = coletor
            }
        }

        if (this.state.dataInicio !== undefined || this.state.dataInicio !== null) {
            const { dataInicio } = this.state
            if (dataInicio) {
                params.dataInicio = dataInicio
            }
        }

        if (this.state.dataFim !== undefined || this.state.dataFim !== null) {
            const { dataFim } = this.state
            if (dataFim) {
                params.dataFim = dataFim
            }
        }

        if (sintetico) {
            params.variante = 'sintetico'
        } else {
            params.variante = 'analitico'
        }

        if (modeloNovo) {
            params.modelo = '2'
        }

        await axios.post('/relatorio/coleta-por-coletor-intervalo-de-data', null, {
            params,
            responseType: 'arraybuffer'
        }).then(response => {
            if (response.status === 200) {
                this.notificacao('success', 'Exportar PDF', 'PDF gerado com sucesso.')
                const file = new Blob([response.data], { type: 'application/pdf' })
                const fileUrl = URL.createObjectURL(file)
                const anchor = document.createElement('a')
                anchor.href = fileUrl
                const formattedDate = new Date().toISOString()
                    .substring(0, 19)
                    .replace(/\D/g, '')
                anchor.download = `coleta-coletor-periodo-${formattedDate}.pdf`
                anchor.click()
                URL.revokeObjectURL(fileUrl)
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
                if (sintetico) {
                    this.setState({
                        loadingExport: false
                    })
                } else if (modeloNovo) {
                    this.setState({
                        loadingExportNovo: false
                    })
                } else {
                    this.setState({
                        loadingExport2: false
                    })
                }
            })
    }

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

    renderBotaoPDF(sintetico, modeloNovo = false) {
        if (modeloNovo) {
            return (
                <Button
                    type="primary"
                    className="login-form-button"
                    onClick={() => this.requisitaExportarPDF(sintetico, modeloNovo)}
                    disabled={this.state.loadingExportNovo}
                >
                    {modeloNovo && this.state.loadingExportNovo
                        ? <Spin indicator={<LoadingOutlined spin />} size="small" style={{ marginRight: 8 }} />
                        : ''}
                    Gerar PDF modelo 2
                </Button>
            )
        }
        return (
            <Button
                type="primary"
                className="login-form-button"
                onClick={() => this.requisitaExportarPDF(sintetico)}
                disabled={sintetico ? this.state.loadingExport : this.state.loadingExport2}
            >
                {sintetico && this.state.loadingExport
                    ? <Spin indicator={<LoadingOutlined spin />} size="small" style={{ marginRight: 8 }} />
                    : ''}
                {!sintetico && this.state.loadingExport2
                    ? <Spin indicator={<LoadingOutlined spin />} size="small" style={{ marginRight: 8 }} />
                    : ''}
                Gerar PDF
                {' '}
                {sintetico ? 'Sintético' : 'Analítico'}
            </Button>
        )
    }

    renderPainelBusca() {
        const { form } = this.props
        const { getFieldDecorator } = form
        return (
            <Card title="Filtros do relatório">
                <Form onSubmit={this.onSubmit}>
                    <Row gutter={8}>
                        <Col span={24}>
                            <span>Coletor:</span>
                        </Col>
                    </Row>
                    <Row gutter={8}>
                        <Col span={24}>
                            <FormItem>
                                {getFieldDecorator('coletor')(
                                    <Input placeholder="John" type="text" />
                                )}
                            </FormItem>
                        </Col>
                    </Row>

                    <Row gutter={8}>
                        <Col span={24}>
                            <span>Intervalo de data:</span>
                        </Col>
                    </Row>
                    <Row gutter={8}>
                        <Col span={24}>
                            <FormItem>
                                {getFieldDecorator('intervaloData')(
                                    <RangePicker
                                        defaultValue={[moment().startOf('month'), moment().endOf('day')]}
                                        format={dateFormat}
                                        locale={dateLocale}
                                        onChange={a => {
                                            this.setState({
                                                dataInicio: a[0].toISOString(),
                                                dataFim: a[1].toISOString()
                                            })
                                        }}
                                    />
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
                                                    coletor: null,
                                                    dataInicio: moment().startOf('month')
                                                        .toISOString(),
                                                    dataFim: moment().endOf('day')
                                                        .toISOString()
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
                <Row
                    gutter={24}
                    style={{
                        marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}
                >
                    <Col xs={24} sm={14} md={18} lg={20} xl={20}>
                        <h2 style={{ fontWeight: 200 }}>Relatório de Coleta por Coletor e Intervalo de Data</h2>
                    </Col>
                    <Col xs={24} sm={10} md={6} lg={4} xl={4} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {this.renderBotaoPDF()}
                            {this.renderBotaoPDF(true)}
                            {this.renderBotaoPDF(false, true)}
                        </div>
                    </Col>
                </Row>

                <Divider dashed />
                {this.renderPainelBusca(getFieldDecorator)}
                <Divider dashed />

                <TableColetaPorLocalData data={this.state.dados} loading={this.state.loading} />
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
export default Form.create()(RelatorioColetorPeriodoScreen)
