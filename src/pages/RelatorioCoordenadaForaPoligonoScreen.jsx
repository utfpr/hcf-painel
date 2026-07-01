import { Component } from 'react'

import {
    Divider, Card, Row, Col,
    Button, notification,
    Spin, Table, Tag,
    Checkbox, Collapse, Select
} from 'antd'
import axios from 'axios'
import { withTranslation } from 'react-i18next'

import TotalRecordFound from '@/components/TotalRecordsFound'
import { Form } from '@ant-design/compatible'
import { LoadingOutlined } from '@ant-design/icons'

const FormItem = Form.Item
const { Panel } = Collapse
const { Option } = Select

class RelatorioCoordenadaForaPoligonoScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {
            dados: [],
            metadados: {},
            loading: false,
            loadingExport: false,
            incluirSemCoordenadas: false,
            paises: [],
            estados: [],
            cidades: [],
            paisId: null,
            estadoId: null,
            cidadeId: null
        }
    }

    componentDidMount() {
        this.requisitaDadosDoRelatorio()
        this.requisitaPaises()
    }

    notificacao = (type, titulo, descricao) => {
        notification[type]({
            message: titulo,
            description: descricao
        })
    }

    requisitaPaises = async () => {
        try {
            const response = await axios.get('/paises')
            if (response.status === 200) {
                const paises = response.data
                this.setState({ paises })

                const bra = paises.find(p => p.sigla === 'BRA')
                if (bra) {
                    this.props.form.setFieldsValue({ pais: bra.id })
                    this.setState({ paisId: bra.id })
                    this.requisitaEstados(bra.id)
                }
            }
        } catch {
            this.notificacao('error', this.props.t('common:erro'), this.props.t('relatorioCoordenadaForaPoligonoScreen:erroBuscarPaises'))
        }
    }

    requisitaEstados = async paisId => {
        try {
            const response = await axios.get('/estados', { params: { pais_id: paisId } })
            if (response.status === 200) {
                const estados = response.data
                this.setState({ estados, cidades: [] })

                const parana = estados.find(e => e.sigla === 'PR')
                if (parana) {
                    this.props.form.setFieldsValue({ estado: parana.id })
                    this.setState({ estadoId: parana.id })
                    this.requisitaCidades(parana.id)
                }
            }
        } catch {
            this.notificacao('error', this.props.t('common:erro'), this.props.t('relatorioCoordenadaForaPoligonoScreen:erroBuscarEstados'))
        }
    }

    requisitaCidades = async estadoId => {
        try {
            const response = await axios.get('/cidades', { params: { id: estadoId } })
            if (response.status === 200) {
                this.setState({
                    cidades: response.data.filter(c => c.estado_id === estadoId)
                })
            }
        } catch {
            this.notificacao('error', this.props.t('common:erro'), this.props.t('relatorioCoordenadaForaPoligonoScreen:erroBuscarCidades'))
        }
    }

    requisitaDadosDoRelatorio = () => {
        this.setState({ loading: true })
        const { incluirSemCoordenadas, paisId, estadoId, cidadeId } = this.state
        const params = {
            incluirSemCoordenadas,
            pagina: 1,
            limite: 99999
        }

        if (paisId) params.pais_id = paisId
        if (estadoId) params.estado_id = estadoId
        if (cidadeId) params.cidade_id = cidadeId

        axios.get('/relatorio/coordenadas-fora-poligono', { params })
            .then(response => {
                this.setState({ loading: false })
                if (response.status === 200) {
                    const { data } = response
                    this.setState({
                        dados: data.resultado,
                        metadados: data.metadados
                    })
                } else {
                    this.notificacao('error', this.props.t('common:erro'), this.props.t('relatorioCoordenadaForaPoligonoScreen:erroBuscarRelatorio'))
                }
            })
            .catch(() => {
                this.setState({ loading: false })
                this.notificacao('error', this.props.t('common:erro'), this.props.t('relatorioCoordenadaForaPoligonoScreen:erroFalhaBuscarRelatorio'))
            })
    }

    renderMotivo = motivo => {
        switch (motivo) {
            case 'SEM_COORDENADA':
                return <Tag color="orange">{this.props.t('relatorioCoordenadaForaPoligonoScreen:motivoSemCoordenada')}</Tag>
            case 'SEM_POLIGONO':
                return <Tag color="blue">{this.props.t('relatorioCoordenadaForaPoligonoScreen:motivoSemPoligono')}</Tag>
            case 'FORA_DO_POLIGONO':
                return <Tag color="red">{this.props.t('relatorioCoordenadaForaPoligonoScreen:motivoForaDoPoligono')}</Tag>
            default:
                return <Tag>{motivo}</Tag>
        }
    }

    handleSubmit = (err) => {
        if (!err) {
            this.requisitaDadosDoRelatorio()
        }
    }

    requisitaExportarPDF = async () => {
        this.setState({ loadingExport: true })
        const { incluirSemCoordenadas, paisId, estadoId, cidadeId } = this.state
        const params = {
            incluirSemCoordenadas,
            pagina: 1,
            limite: 99999
        }

        if (paisId) params.pais_id = paisId
        if (estadoId) params.estado_id = estadoId
        if (cidadeId) params.cidade_id = cidadeId

        await axios.post('/relatorio/coordenadas-fora-poligono', null, {
            params,
            responseType: 'arraybuffer'
        }).then(response => {
            if (response.status === 200) {
                this.notificacao('success', this.props.t('relatorioCoordenadaForaPoligonoScreen:exportarPDF'), this.props.t('relatorioCoordenadaForaPoligonoScreen:sucessoExportarPDF'))
                const file = new Blob([response.data], { type: 'application/pdf' })
                const fileUrl = URL.createObjectURL(file)
                const anchor = document.createElement('a')
                anchor.href = fileUrl
                const formattedDate = new Date().toISOString()
                    .substring(0, 19)
                    .replace(/\D/g, '')
                anchor.download = `diagnostico-posicionamento-${formattedDate}.pdf`
                anchor.click()
                URL.revokeObjectURL(fileUrl)
            } else if (response.status === 400) {
                this.notificacao('warning', this.props.t('relatorioCoordenadaForaPoligonoScreen:exportarPDF'), this.props.t('relatorioCoordenadaForaPoligonoScreen:erroExportarPDF'))
            } else {
                this.notificacao('error', this.props.t('common:erro'), this.props.t('relatorioCoordenadaForaPoligonoScreen:erroServidorExportarPDF'))
            }
        })
            .catch(err => {
                const { response } = err
                if (response && response.data) {
                    // eslint-disable-next-line no-console
                    console.error('Erro ao exportar PDF:', err)
                }
                this.notificacao('error', this.props.t('common:erro'), this.props.t('relatorioCoordenadaForaPoligonoScreen:falhaExportarPDF'))
            })
            .finally(() => {
                this.setState({ loadingExport: false })
            })
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
                {this.props.t('relatorioCoordenadaForaPoligonoScreen:gerarPDF')}
            </Button>
        )
    }

    onSubmit = event => {
        event.preventDefault()
        const { form } = this.props
        form.validateFields(this.handleSubmit)
    }

    renderPainelBusca() {
        const { form } = this.props
        const { getFieldDecorator } = form
        const { paises, estados, cidades } = this.state

        return (
            <Card title={this.props.t('relatorioCoordenadaForaPoligonoScreen:filtros')}>
                <Form onSubmit={this.onSubmit}>
                    {/* Linha 1: País / Estado / Cidade */}
                    <Row gutter={8}>
                        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                            <Col span={24}><span>{this.props.t('relatorioCoordenadaForaPoligonoScreen:pais')}</span></Col>
                            <Col span={24}>
                                <FormItem>
                                    {getFieldDecorator('pais')(
                                        <Select
                                            placeholder={this.props.t('relatorioCoordenadaForaPoligonoScreen:selecionePais')}
                                            allowClear
                                            showSearch
                                            optionFilterProp="children"
                                            onChange={value => {
                                                if (value) {
                                                    this.setState({ paisId: value, estadoId: null, cidadeId: null })
                                                    this.requisitaEstados(value)
                                                    this.props.form.setFieldsValue({ estado: undefined, cidade: undefined })
                                                } else {
                                                    this.setState({ paisId: null, estadoId: null, cidadeId: null, estados: [], cidades: [] })
                                                    this.props.form.setFieldsValue({ estado: undefined, cidade: undefined })
                                                }
                                            }}
                                        >
                                            {paises.map(item => (
                                                <Option key={item.id} value={item.id}>{item.nome}</Option>
                                            ))}
                                        </Select>
                                    )}
                                </FormItem>
                            </Col>
                        </Col>

                        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                            <Col span={24}><span>{this.props.t('relatorioCoordenadaForaPoligonoScreen:estado')}</span></Col>
                            <Col span={24}>
                                <FormItem>
                                    {getFieldDecorator('estado')(
                                        <Select
                                            placeholder={this.props.t('relatorioCoordenadaForaPoligonoScreen:selecioneEstado')}
                                            allowClear
                                            showSearch
                                            optionFilterProp="children"
                                            onChange={value => {
                                                if (value) {
                                                    this.setState({ estadoId: value, cidadeId: null })
                                                    this.requisitaCidades(value)
                                                    this.props.form.setFieldsValue({ cidade: undefined })
                                                } else {
                                                    this.setState({ estadoId: null, cidadeId: null, cidades: [] })
                                                    this.props.form.setFieldsValue({ cidade: undefined })
                                                }
                                            }}
                                        >
                                            {estados.map(item => (
                                                <Option key={item.id} value={item.id}>{item.nome}</Option>
                                            ))}
                                        </Select>
                                    )}
                                </FormItem>
                            </Col>
                        </Col>

                        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                            <Col span={24}><span>{this.props.t('relatorioCoordenadaForaPoligonoScreen:cidade')}</span></Col>
                            <Col span={24}>
                                <FormItem>
                                    {getFieldDecorator('cidade')(
                                        <Select
                                            placeholder={this.props.t('relatorioCoordenadaForaPoligonoScreen:selecioneCidade')}
                                            allowClear
                                            showSearch
                                            optionFilterProp="children"
                                            onChange={value => {
                                                this.setState({ cidadeId: value || null })
                                            }}
                                        >
                                            {cidades.map(item => (
                                                <Option key={item.id} value={item.id}>{item.nome}</Option>
                                            ))}
                                        </Select>
                                    )}
                                </FormItem>
                            </Col>
                        </Col>
                    </Row>

                    {/* Linha 2: Checkbox + botões */}
                    <Row gutter={8} style={{ marginTop: 8 }}>
                        <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                            <FormItem>
                                {getFieldDecorator('incluirSemCoordenadas')(
                                    <Checkbox
                                        onChange={e => {
                                            this.setState({ incluirSemCoordenadas: e.target.checked })
                                        }}
                                    >
                                        {this.props.t('relatorioCoordenadaForaPoligonoScreen:incluirSemCoordenadas')}
                                    </Checkbox>
                                )}
                            </FormItem>
                        </Col>
                    </Row>

                    <Row style={{ marginTop: 16 }}>
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
                                                    incluirSemCoordenadas: false,
                                                    paisId: null,
                                                    estadoId: null,
                                                    cidadeId: null,
                                                    estados: [],
                                                    cidades: []
                                                }, () => {
                                                    this.requisitaDadosDoRelatorio()
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

    renderTabelaTombos(tombos) {
        const columns = [
            {
                title: this.props.t('relatorioCoordenadaForaPoligonoScreen:colunaHCF'),
                dataIndex: 'hcf',
                key: 'hcf',
                sorter: (a, b) => a.hcf - b.hcf
            },
            {
                title: this.props.t('relatorioCoordenadaForaPoligonoScreen:colunaNomeCientifico'),
                dataIndex: 'nome_cientifico',
                key: 'nome_cientifico',
                ellipsis: true
            },
            {
                title: this.props.t('relatorioCoordenadaForaPoligonoScreen:colunaColetorPrincipal'),
                dataIndex: 'coletor_nome',
                key: 'coletor_nome',
                ellipsis: true,
                render: val => val || '—'
            },
            {
                title: this.props.t('relatorioCoordenadaForaPoligonoScreen:colunaLatitude'),
                dataIndex: 'latitude',
                key: 'latitude',
                render: val => (val !== null && val !== undefined ? val.toFixed(6) : '—')
            },
            {
                title: this.props.t('relatorioCoordenadaForaPoligonoScreen:colunaLongitude'),
                dataIndex: 'longitude',
                key: 'longitude',
                render: val => (val !== null && val !== undefined ? val.toFixed(6) : '—')
            },
            {
                title: this.props.t('relatorioCoordenadaForaPoligonoScreen:colunaMotivo'),
                dataIndex: 'motivo',
                key: 'motivo',
                render: motivo => this.renderMotivo(motivo),
                filters: [
                    { text: this.props.t('relatorioCoordenadaForaPoligonoScreen:motivoForaDoPoligono'), value: 'FORA_DO_POLIGONO' },
                    { text: this.props.t('relatorioCoordenadaForaPoligonoScreen:motivoSemCoordenada'), value: 'SEM_COORDENADA' },
                    { text: this.props.t('relatorioCoordenadaForaPoligonoScreen:motivoSemPoligono'), value: 'SEM_POLIGONO' }
                ],
                onFilter: (value, record) => record.motivo === value
            }
        ]

        return (
            <Table
                columns={columns}
                dataSource={tombos.map(t => ({ ...t, key: t.hcf }))}
                size="small"
                pagination={{ pageSize: 20, showSizeChanger: true }}
            />
        )
    }

    renderResultados() {
        const { dados, loading } = this.state

        if (loading) {
            return (
                <div style={{ textAlign: 'center', padding: 40 }}>
                    <Spin indicator={<LoadingOutlined spin />} size="large" />
                </div>
            )
        }

        if (!dados || dados.length === 0) {
            return (
                <Card>
                    <p style={{ textAlign: 'center', color: '#999' }}>
                        {this.props.t('relatorioCoordenadaForaPoligonoScreen:nenhumRegistro')}
                    </p>
                </Card>
            )
        }

        return (
            <Collapse accordion={false} defaultActiveKey={[]}>
                {dados.map(estado => (
                    <Panel
                        header={`${estado.estado} (${estado.sigla})`}
                        key={estado.estado}
                        extra={
                            <Tag>
                                {estado.cidades.reduce((acc, c) => acc + c.tombos.length, 0)}
                                {' '}
                                tombo(s)
                            </Tag>
                        }
                    >
                        <Collapse accordion={false} defaultActiveKey={[]}>
                            {estado.cidades.map(cidade => (
                                <Panel
                                    header={cidade.cidade}
                                    key={`${estado.estado}-${cidade.cidade}`}
                                    extra={
                                        <Tag>{cidade.tombos.length} tombo(s)</Tag>
                                    }
                                >
                                    {this.renderTabelaTombos(cidade.tombos)}
                                </Panel>
                            ))}
                        </Collapse>
                    </Panel>
                ))}
            </Collapse>
        )
    }

    renderFormulario() {
        return (
            <div>
                <Row
                    gutter={24}
                    style={{
                        marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}
                >
                    <Col xs={24} sm={14} md={18} lg={20} xl={20}>
                        <h2 style={{ fontWeight: 200 }}>{this.props.t('relatorioCoordenadaForaPoligonoScreen:titulo')}</h2>
                    </Col>
                    <Col xs={24} sm={10} md={6} lg={4} xl={4} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {this.renderBotaoPDF()}
                        </div>
                    </Col>
                </Row>

                <Divider dashed />
                {this.renderPainelBusca()}
                <Divider dashed />

                {this.renderResultados()}
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

export default withTranslation()(Form.create()(RelatorioCoordenadaForaPoligonoScreen))
