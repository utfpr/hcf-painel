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
import { withTranslation } from 'react-i18next'

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

class RelatorioInventarioEspeciesScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {
            dados: [],
            metadados: {},
            pagina: 1,
            loading: false,
            loadingExport: false,
            loadingExport2: false,
            dataInicio: null,
            dataFim: null,
            local: null
        }
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

        const { local, intervaloData } = valores || {}
        const intervaloCompleto = intervaloData?.[0] && intervaloData?.[1]

        if (!local && !intervaloCompleto) {
            this.setState({
                dados: [],
                metadados: {},
                loading: false,
                local: null,
                dataInicio: null,
                dataFim: null
            })
            return
        }

        if (local) params.local = local
        if (intervaloCompleto) {
            params.dataInicio = intervaloData[0].toISOString()
            params.dataFim = intervaloData[1].toISOString()
        }

        this.setState({
            local: local || null,
            dataInicio: intervaloCompleto ? params.dataInicio : null,
            dataFim: intervaloCompleto ? params.dataFim : null
        })

        axios.get('/relatorio/coleta-por-local-intervalo-de-data', { params })
            .then(response => {
                this.setState({
                    loading: false
                })
                if (response.status === 200) {
                    const { data } = response
                    this.setState({
                        dados: data.resultado,
                        metadados: data.metadados
                    })
                } else if (response.status === 400) {
                    this.notificacao('warning', this.props.t('relatorioColetaLocalPeriodoScreen:notifBuscarDados'), this.props.t('relatorioColetaLocalPeriodoScreen:erroBuscarDados'))
                } else {
                    this.notificacao('error', this.props.t('common:error'), this.props.t('relatorioColetaLocalPeriodoScreen:erroServidorBuscarDados'))
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

    requisitaExportarPDF = async sintetico => {
        if (sintetico) {
            this.setState({
                loadingExport: true
            })
        } else {
            this.setState({
                loadingExport2: true
            })
        }
        const params = {}

        const { local, dataInicio, dataFim } = this.state
        if (local) params.local = local
        if (dataInicio) params.dataInicio = dataInicio
        if (dataFim) params.dataFim = dataFim

        if (sintetico) {
            params.variante = 'sintetico'
        } else {
            params.variante = 'analitico'
        }

        await axios.post('/relatorio/coleta-por-local-intervalo-de-data', null, {
            params,
            responseType: 'arraybuffer'
        }).then(response => {
            if (response.status === 200) {
                this.notificacao('success', this.props.t('relatorioColetaLocalPeriodoScreen:notifExportarPDF'), this.props.t('relatorioColetaLocalPeriodoScreen:pdfSucesso'))
                const file = new Blob([response.data], { type: 'application/pdf' })
                const fileUrl = URL.createObjectURL(file)
                const anchor = document.createElement('a')
                anchor.href = fileUrl
                const formattedDate = new Date().toISOString()
                    .substring(0, 19)
                    .replace(/\D/g, '')
                anchor.download = `coleta-local-periodo-${formattedDate}.pdf`
                anchor.click()
                URL.revokeObjectURL(fileUrl)
            } else if (response.status === 400) {
                this.notificacao('warning', this.props.t('relatorioColetaLocalPeriodoScreen:notifExportarPDF'), this.props.t('relatorioColetaLocalPeriodoScreen:erroExportarPDF'))
            } else {
                this.notificacao('error', this.props.t('common:error'), this.props.t('relatorioColetaLocalPeriodoScreen:erroServidorExportarPDF'))
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

    renderBotaoPDF(sintetico) {
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
                {this.props.t('relatorioColetaLocalPeriodoScreen:gerarPDF')}
                {' '}
                {sintetico ? this.props.t('relatorioColetaLocalPeriodoScreen:sintetico') : this.props.t('relatorioColetaLocalPeriodoScreen:analitico')}
            </Button>
        )
    }

    renderPainelBusca() {
        const { form } = this.props
        const { getFieldDecorator } = form
        return (
            <Card title={this.props.t('relatorioColetaLocalPeriodoScreen:filtros')}>
                <Form onSubmit={this.onSubmit}>
                    <Row gutter={8}>
                        <Col span={24}>
                            <span>{this.props.t('relatorioColetaLocalPeriodoScreen:local')}</span>
                        </Col>
                    </Row>
                    <Row gutter={8}>
                        <Col span={24}>
                            <FormItem>
                                {getFieldDecorator('local')(
                                    <Input placeholder={this.props.t('relatorioColetaLocalPeriodoScreen:placeholderLocal')} type="text" />
                                )}
                            </FormItem>
                        </Col>
                    </Row>

                    <Row gutter={8}>
                        <Col span={24}>
                            <span>{this.props.t('relatorioColetaLocalPeriodoScreen:intervaloData')}</span>
                        </Col>
                    </Row>
                    <Row gutter={8}>
                        <Col span={24}>
                            <FormItem>
                                {getFieldDecorator('intervaloData')(
                                    <RangePicker
                                        format={dateFormat}
                                        locale={dateLocale}
                                        onChange={intervaloData => {
                                            this.setState({
                                                dataInicio: intervaloData?.[0]?.toISOString() || null,
                                                dataFim: intervaloData?.[1]?.toISOString() || null
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
                                                    dados: [],
                                                    metadados: {},
                                                    local: null,
                                                    dataInicio: null,
                                                    dataFim: null,
                                                    loading: false
                                                })
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
                                            className="login-form-button"
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
                        <h2 style={{ fontWeight: 200 }}>{this.props.t('relatorioColetaLocalPeriodoScreen:titulo')}</h2>
                    </Col>
                    <Col xs={24} sm={10} md={6} lg={4} xl={4} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {this.renderBotaoPDF()}
                            {this.renderBotaoPDF(true)}
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
const RelatorioColetaLocalPeriodoScreenWithForm = Form.create()(RelatorioInventarioEspeciesScreen)

export default withTranslation()(RelatorioColetaLocalPeriodoScreenWithForm)
