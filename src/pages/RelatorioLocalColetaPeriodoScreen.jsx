/* eslint-disable react/destructuring-assignment */
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

import TableCollapseParaLocais from '@/components/TableCollapseParaLocais'
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

class RelatorioLocalColetaScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {
            dados: [],
            metadados: {},
            pagina: 1,
            loading: false,
            loadingExport: false,
            loadingExport2: false,
            dataInicio: moment().startOf('month')
                .toISOString(),
            dataFim: moment().endOf('day')
                .toISOString(),
            local: null,
            estados: [],
            cidades: [],
            paises: [],
            locais: [],
            showCoordenadas: false
        }
    }

    componentDidMount() {
        const { pagina } = this.state
        this.requisitaDadosDoRelatorio({}, pagina, null, null, true)
        this.requisitaPaises()
        this.requisitaListaLocais({ requisicaoInicial: true }, null)
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

    formataDadosLocaisOption = () => this.state.locais.map(item => (
        <Option key={item.key} value={item.id}>{item.nome}</Option>
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

    requisitaListaLocais = async (valores, sorter) => {
        const params = {
            pagina: 1,
            limite: 9999
        }

        if (valores !== undefined) {
            const { cidade } = valores

            if (cidade) {
                params.cidade_id = cidade
            }
        }

        const campo = sorter && sorter.field ? sorter.field : 'descricao'
        const ordem = sorter && sorter.order === 'descend' ? 'desc' : 'asc'
        params.order = `${campo}:${ordem}`

        try {
            const response = await axios.get('/locais-coleta', { params })

            if (response.status === 200) {
                let { pais } = valores
                let { estado } = valores
                if (valores.requisicaoInicial) {
                    const bra = this.state.paises.find(p => p.sigla === 'BRA')
                    if (bra) {
                        pais = bra.id
                    }
                    const parana = this.state.estados.find(e => e.sigla === 'PR')
                    if (parana) {
                        estado = parana.id
                    }
                }

                const res = this.formataDadosLocais(response.data.resultado, pais, estado)
                this.setState({
                    locais: res
                })
            } else if (response.status === 400) {
                this.notificacao('warning', 'Buscar locais', 'Erro ao buscar os locais de coleta.')
                this.setState({ loading: false })
            } else {
                this.notificacao('error', 'Erro', 'Erro do servidor ao buscar os locais de coleta.')
                this.setState({ loading: false })
            }
        } catch (err) {
            this.setState({ loading: false })
            this.notificacao('error', 'Erro', 'Falha ao buscar locais de coleta.')
        }
    }

    formataDadosLocais = (locais, pais, estado) => locais.map(item => ({
        key: item.id,
        nome: item.descricao,
        pais: item.cidade?.estado?.paise?.nome || '',
        paisId: item.cidade?.estado?.paise?.id || null,
        estado: item.cidade?.estado?.nome || '',
        estadoId: item.cidade?.estado?.id || null,
        cidade: item.cidade?.nome || ''
    })).filter(l => {
        if (pais && estado) {
            return l.paisId === pais && l.estadoId === estado
        } if (pais && !estado) {
            return l.paisId === pais
        }
        return true
    })
        .filter(v => v.nome)

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
            const { local } = valores
            const { dataInicio, dataFim } = this.state
            if (local) {
                params.local = local
                this.setState({
                    local
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
        axios.get('/relatorio/local-coleta', { params })
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

        if (this.state.local !== undefined || this.state.local !== null) {
            const { local } = this.state

            if (local) {
                params.local = local
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

        if (this.state.showCoordenadas) {
            params.showCoord = this.state.showCoordenadas
        }

        await axios.post('/relatorio/local-coleta', null, {
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
                anchor.download = `coleta-local-periodo-${formattedDate}.pdf`
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
                                                    this.requisitaListaLocais({
                                                        pais: value
                                                    }, null)
                                                } else {
                                                    this.setState({
                                                        estados: [],
                                                        cidades: []
                                                    })
                                                    this.props.form.setFields({
                                                        estado: { value: undefined },
                                                        cidade: { value: undefined }
                                                    })
                                                    this.requisitaListaLocais({}, null)
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
                                                    this.requisitaListaLocais({
                                                        estado: value,
                                                        pais: this.props.form.getFieldValue('pais')
                                                    }, null)
                                                } else {
                                                    this.setState({ cidades: [] })
                                                    this.props.form.setFields({
                                                        cidade: { value: undefined }
                                                    })
                                                    this.requisitaListaLocais({
                                                        pais: this.props.form.getFieldValue('pais')
                                                    }, null)
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
                                            onChange={value => {
                                                if (value) {
                                                    this.requisitaListaLocais({
                                                        cidade: value,
                                                        estado: this.props.form.getFieldValue('estado'),
                                                        pais: this.props.form.getFieldValue('pais')
                                                    }, null)
                                                } else {
                                                    this.requisitaListaLocais({
                                                        estado: this.props.form.getFieldValue('estado'),
                                                        pais: this.props.form.getFieldValue('pais')
                                                    }, null)
                                                }
                                            }}
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
                                <span>Local:</span>
                            </Col>
                        </Col>
                    </Row>
                    <Row gutter={8}>
                        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                            <Col span={24}>
                                <FormItem>
                                    {getFieldDecorator('local')(
                                        <Select
                                            placeholder="Selecione o local de coleta"
                                            allowClear
                                            showSearch
                                            optionFilterProp="children"
                                        >
                                            {this.formataDadosLocaisOption()}
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
                                                    metadados: {},
                                                    local: null,
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
                        <h2 style={{ fontWeight: 200 }}>Relatório de Locais de Coleta por Local e Intervalo de Data</h2>
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

                <TableCollapseParaLocais
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
export default Form.create()(RelatorioLocalColetaScreen)
