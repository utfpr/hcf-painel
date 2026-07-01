import { Component } from 'react'

import {
    Divider, Card, Row, Col,
    Button, notification,
    Spin,
    Select,
    Checkbox
} from 'antd'
import axios from 'axios'
import { withTranslation } from 'react-i18next'

import TableCollapseParaCidades from '@/components/TableCollapseParaCidades'
import TotalRecordFound from '@/components/TotalRecordsFound'
import { Form } from '@ant-design/compatible'
import { LoadingOutlined } from '@ant-design/icons'

const FormItem = Form.Item
const { Option } = Select



class RelatorioTombosPorCidadeScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {
            dados: [],
            metadados: {},
            pagina: 1,
            loading: false,
            loadingExport: false,
            cidadeId: null,
            estados: [],
            cidades: [],
            paises: [],
            showCoordenadas: false
        }
    }

    componentDidMount() {
        const { pagina } = this.state
        // não carregar automaticamente - aguardar o usuário clicar em Pesquisar
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
            this.notificacao('error', this.props.t('common:erro'), this.props.t('relatorioTombosPorCidadeScreen:erroBuscarPaises'))
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
            this.notificacao('error', this.props.t('common:erro'), this.props.t('relatorioTombosPorCidadeScreen:erroBuscarEstados'))
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
            this.notificacao('error', this.props.t('common:erro'), this.props.t('relatorioTombosPorCidadeScreen:erroBuscarCidades'))
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
            const { cidade, estado, pais } = valores
            if (cidade) {
                params.cidade = cidade
                this.setState({ cidadeId: cidade })
            }
            if (estado) {
                params.estado = estado
                this.setState({ estadoId: estado })
            }
            if (pais) {
                params.pais = pais
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
                    this.notificacao('warning', this.props.t('common:pesquisar'), this.props.t('relatorioTombosPorCidadeScreen:erroBuscarDados'))
                } else {
                    this.notificacao('error', this.props.t('common:erro'), this.props.t('relatorioTombosPorCidadeScreen:erroServidorBuscarDados'))
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

        const { form } = this.props
        const cidadeField = this.state.cidadeId || form.getFieldValue('cidade')
        const estadoField = this.state.estadoId || form.getFieldValue('estado')
        const paisField = form.getFieldValue('pais')

        if (cidadeField) params.cidade = cidadeField
        if (estadoField) params.estado = estadoField
        if (paisField) params.pais = paisField

        if (this.state.showCoordenadas) {
            params.showCoord = this.state.showCoordenadas
        }

        await axios.post('/relatorio/tombos-por-cidade', null, {
            params,
            responseType: 'arraybuffer'
        }).then(response => {
            if (response.status === 200) {
                this.notificacao('success', this.props.t('relatorioTombosPorCidadeScreen:exportarPDF'), this.props.t('relatorioTombosPorCidadeScreen:sucessoExportarPDF'))
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
                this.notificacao('warning', this.props.t('relatorioTombosPorCidadeScreen:exportarPDF'), this.props.t('relatorioTombosPorCidadeScreen:erroExportarPDF'))
            } else {
                this.notificacao('error', this.props.t('common:erro'), this.props.t('relatorioTombosPorCidadeScreen:erroServidorExportarPDF'))
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
                {this.props.t('relatorioTombosPorCidadeScreen:gerarPDF')}
                {' '}
            </Button>
        )
    }

    renderPainelBusca() {
        const { form } = this.props
        const { getFieldDecorator } = form
        return (
            <Card title={this.props.t('relatorioTombosPorCidadeScreen:filtros')}>
                <Form onSubmit={this.onSubmit}>
                    <Row gutter={8}>
                        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                            <Col span={24}>
                                <span>{this.props.t('relatorioTombosPorCidadeScreen:pais')}</span>
                            </Col>
                            <Col span={24}>
                                <FormItem>
                                    {getFieldDecorator('pais')(
                                        <Select
                                            defaultValue={this.state.paises.find(item => item.sigla === 'BRA')?.id}
                                            placeholder={this.props.t('relatorioTombosPorCidadeScreen:selecionePais')}
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
                                <span>{this.props.t('relatorioTombosPorCidadeScreen:estado')}</span>
                            </Col>
                            <Col span={24}>
                                <FormItem>
                                    {getFieldDecorator('estado')(
                                        <Select
                                            placeholder={this.props.t('relatorioTombosPorCidadeScreen:selecioneEstado')}
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
                                <span>{this.props.t('relatorioTombosPorCidadeScreen:cidade')}</span>
                            </Col>
                            <Col span={24}>
                                <FormItem>
                                    {getFieldDecorator('cidade')(
                                        <Select
                                            placeholder={this.props.t('relatorioTombosPorCidadeScreen:selecioneCidade')}
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
                                <span>{this.props.t('relatorioTombosPorCidadeScreen:outrasOpcoes')}</span>
                            </Col>
                            <Col span={24}>
                                <FormItem>
                                    {getFieldDecorator('showCoord')(
                                        <Checkbox onChange={e => {
                                            this.setState({ showCoordenadas: e.target.checked })
                                        }}
                                        >
                                            {this.props.t('relatorioTombosPorCidadeScreen:mostrarCoordenadas')}
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
                                                    cidadeId: null
                                                })
                                                // limpar resultados exibidos
                                                this.setState({ dados: [] })
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
                        <h2 style={{ fontWeight: 200 }}>{this.props.t('relatorioTombosPorCidadeScreen:titulo')}</h2>
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
export default withTranslation()(Form.create()(RelatorioTombosPorCidadeScreen))
