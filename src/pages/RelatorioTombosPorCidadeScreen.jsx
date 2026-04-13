import { Component } from 'react'

import {
    Divider, Card, Row, Col,
    Button, notification,
    Spin,
    DatePicker,
    Select,
    Checkbox
} from 'antd'
import ptbr from 'antd/es/date-picker/locale/pt_BR'
import axios from 'axios'
import moment from 'moment'

import TableCollapseParaCidades from '@/components/TableCollapseParaCidades'
import TotalRecordFound from '@/components/TotalRecordsFound'
import { Form } from '@ant-design/compatible'
import { LoadingOutlined } from '@ant-design/icons'

const FormItem = Form.Item
const { Option } = Select

const dateFormat = 'DD/MM/YYYY'
const dateLocale = {
    ...ptbr,
    lang: {
        ...ptbr.lang
    }
}

class RelatorioTombosPorCidadeScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {
            dados: [],
            metadados: {},
            pagina: 1,
            loading: false,
            loadingExport: false,
            dataInicio: moment().startOf('month')
                .toISOString(),
            dataFim: moment().endOf('day')
                .toISOString(),
            cidadeId: null,
            estados: [],
            cidades: [],
            paises: [],
            showCoordenadas: false
        }
    }

    componentDidMount() {
        const { pagina } = this.state
        this.requisitaDadosDoRelatorio({}, pagina, null, null, true)
        this.requisitaPaises()
    }

    requisitaPaises = async () => {
        try {
            const response = await axios.get('/paises')

            if (response.status === 200) {
                const paises = response.data
                this.setState({
                    paises
                })

                const bra = paises.find(p => p.sigla === 'BRA')
                if (bra) {
                    this.props.form.setFieldsValue({ pais: bra.id })
                    this.requisitaEstados(bra.id)
                }
            }
        } catch (err) {
            this.notificacao('error', 'Erro', 'Falha ao buscar países.')
        }
    }

    formataDadosPaises = () => this.state.paises.map(item => (
        <Option key={item.id} value={item.id}>{item.nome}</Option>
    ))

    formataDadosEstados = () => this.state.estados.map(item => (
        <Option key={item.id} value={item.id}>{item.nome}</Option>
    ))

    formataDadosCidades = () => this.state.cidades.map(item => (
        <Option key={item.id} value={item.id}>{item.nome}</Option>
    ))

    requisitaEstados = async paisId => {
        try {
            const response = await axios.get('/estados', {
                params: { pais_id: paisId }
            })

            if (response.status === 200) {
                const estados = response.data
                this.setState({
                    estados,
                    cidades: []
                })

                const parana = estados.find(e => e.sigla === 'PR')
                if (parana) {
                    this.props.form.setFieldsValue({ estado: parana.id })
                    this.requisitaCidades(parana.id)
                }
            }
        } catch (err) {
            this.notificacao('error', 'Erro', 'Falha ao buscar estados.')
        }
    }

    requisitaCidades = async estadoId => {
        try {
            const response = await axios.get('/cidades', {
                params: { id: estadoId }
            })

            if (response.status === 200) {
                this.setState({
                    cidades: response.data.filter(c => c.estado_id === estadoId)
                })
            }
        } catch (err) {
            this.notificacao('error', 'Erro', 'Falha ao buscar cidades.')
        }
    }

    notificacao = (type, titulo, descricao) => {
        notification[type]({
            message: titulo,
            description: descricao
        })
    }

    requisitaDadosDoRelatorio = (valores, pg, pageSize, sorter, paraTabela) => {
        const params = {
            pagina: pg,
            limite: pageSize || 100,
            paraTabela
        }

        if (valores !== undefined) {
            const { cidade } = valores
            const { dataInicio, dataFim } = this.state
            if (cidade) {
                params.cidade = cidade
                this.setState({
                    cidadeId: cidade
                })
            }
            if (dataInicio && dataFim) {
                params.dataInicio = dataInicio
                params.dataFim = dataFim
                this.setState({
                    dataInicio,
                    dataFim
                })
            } else {
                params.dataInicio = moment().startOf('month')
                    .toISOString()
                params.dataFim = moment().endOf('day')
                    .toISOString()
            }
        }
        axios.get('/relatorio/tombos-por-cidade', { params })
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

        if (this.state.cidadeId) {
            params.cidade = this.state.cidadeId
        }

        if (this.state.dataInicio) {
            params.dataInicio = this.state.dataInicio
        }

        if (this.state.dataFim) {
            params.dataFim = this.state.dataFim
        }

        if (this.state.showCoordenadas) {
            params.showCoord = this.state.showCoordenadas
        }

        await axios.post('/relatorio/tombos-por-cidade', null, {
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
                anchor.download = `tombos-por-cidade-${formattedDate}.pdf`
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
                this.setState({
                    loadingExport: false
                })
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
                {' '}
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
                        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <span>País:</span>
                            </Col>
                            <Col span={24}>
                                <FormItem>
                                    {getFieldDecorator('pais')(
                                        <Select
                                            defaultValue={this.state.paises.find(item => item.sigla === 'BRA')?.id}
                                            placeholder="Selecione um país"
                                            allowClear
                                            showSearch
                                            optionFilterProp="children"
                                            onChange={value => {
                                                if (value) {
                                                    this.requisitaEstados(value)
                                                } else {
                                                    this.setState({
                                                        estados: [],
                                                        cidades: []
                                                    })
                                                    this.props.form.setFields({
                                                        estado: { value: undefined },
                                                        cidade: { value: undefined }
                                                    })
                                                }
                                            }}
                                        >
                                            {this.formataDadosPaises()}
                                        </Select>
                                    )}
                                </FormItem>
                            </Col>
                        </Col>

                        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <span>Estado:</span>
                            </Col>
                            <Col span={24}>
                                <FormItem>
                                    {getFieldDecorator('estado')(
                                        <Select
                                            placeholder="Selecione um estado"
                                            allowClear
                                            showSearch
                                            optionFilterProp="children"
                                            onChange={value => {
                                                if (value) {
                                                    this.requisitaCidades(value)
                                                } else {
                                                    this.setState({ cidades: [] })
                                                    this.props.form.setFields({
                                                        cidade: { value: undefined }
                                                    })
                                                }
                                            }}
                                        >
                                            {this.formataDadosEstados()}
                                        </Select>
                                    )}
                                </FormItem>
                            </Col>
                        </Col>

                        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <span>Cidade:</span>
                            </Col>
                            <Col span={24}>
                                <FormItem>
                                    {getFieldDecorator('cidade')(
                                        <Select
                                            placeholder="Selecione uma cidade"
                                            allowClear
                                            showSearch
                                            optionFilterProp="children"
                                        >
                                            {this.formataDadosCidades()}
                                        </Select>
                                    )}
                                </FormItem>
                            </Col>
                        </Col>
                    </Row>

                    <Row gutter={8} style={{ marginTop: 16 }}>
                        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <span>Data inicial:</span>
                            </Col>
                            <Col span={24}>
                                <FormItem>
                                    {getFieldDecorator('dataInicio')(
                                        <DatePicker
                                            defaultValue={moment().startOf('month')}
                                            style={{ width: '100%' }}
                                            format="DD/MM/YYYY"
                                            locale={dateLocale}
                                            onChange={(a, b) => {
                                                this.setState({
                                                    dataInicio: moment(b, dateFormat).toISOString()
                                                })
                                            }}
                                        />
                                    )}
                                </FormItem>
                            </Col>
                        </Col>
                        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <span>Data final:</span>
                            </Col>
                            <Col span={24}>
                                <FormItem>
                                    {getFieldDecorator('dataFim')(
                                        <DatePicker
                                            defaultValue={moment().endOf('day')}
                                            style={{ width: '100%' }}
                                            format="DD/MM/YYYY"
                                            locale={dateLocale}
                                            onChange={a => {
                                                this.setState({
                                                    dataFim: a.toISOString()
                                                })
                                            }}
                                        />
                                    )}
                                </FormItem>
                            </Col>
                        </Col>
                        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <span>Outras opções:</span>
                            </Col>
                            <Col span={24}>
                                <FormItem>
                                    {getFieldDecorator('showCoord')(
                                        <Checkbox onChange={e => {
                                            this.setState({ showCoordenadas: e.target.checked })
                                        }}
                                        >
                                            Mostrar coordenadas
                                        </Checkbox>
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
                                                const { form: formRef } = this.props
                                                formRef.resetFields()
                                                this.setState({
                                                    pagina: 1,
                                                    metadados: {},
                                                    cidadeId: null,
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
                        <h2 style={{ fontWeight: 200 }}>Relatório de Tombos por Cidade</h2>
                    </Col>
                    <Col xs={24} sm={10} md={6} lg={4} xl={4} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {this.renderBotaoPDF()}
                        </div>
                    </Col>
                </Row>

                <Divider dashed />
                {this.renderPainelBusca(getFieldDecorator)}
                <Divider dashed />

                <TableCollapseParaCidades
                    data={this.state.dados?.locais}
                    loading={this.state.loading}
                    showCoordenadas={this.state.showCoordenadas}
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
export default Form.create()(RelatorioTombosPorCidadeScreen)
