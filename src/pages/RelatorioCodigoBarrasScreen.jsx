/* eslint-disable react/destructuring-assignment */
import { Component } from 'react'

import {
    Divider, Card, Row, Col,
    Button, notification,
    Spin,
    DatePicker
} from 'antd'
import ptbr from 'antd/es/date-picker/locale/pt_BR'
import axios from 'axios'
import moment from 'moment'
import { Link } from 'react-router-dom'

import GradeDeCartoes from '@/components/GradeCartoes'
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

class RelatorioCodigoBarrasScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {
            dados: [],
            metadados: {},
            pagina: 1,
            loadingExport: false,
            loadingExport2: false,
            dataInicio: moment().startOf('month')
                .toISOString(),
            dataFim: moment().endOf('day')
                .toISOString(),
            local: null
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
            const { local, intervaloData } = valores

            if (local) {
                params.local = local
                this.setState({
                    local
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
        axios.get('/relatorio/codigo-barras', { params })
            .then(response => {
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
                const { response } = err
                if (response && response.data) {
                    const { error } = response.data
                    // eslint-disable-next-line no-console
                    console.error(error.message)
                }
            })
            .catch(this.catchRequestError)
    }

    handleSubmit = (err, valores) => {
        if (!err) {
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
                disabled={this.state.loadingExport}
                onClick={() => {
                    this.setState({ loadingExport: true })
                    window.print()
                    setTimeout(() => {
                        this.setState({ loadingExport: false })
                    }, 1000)
                }}
            >
                {this.state.loadingExport
                    ? <Spin indicator={<LoadingOutlined spin />} size="small" style={{ marginRight: 8 }} />
                    : ''}
                Gerar página para impressão
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
                                            className="login-form-button ant-btn-pesquisar"
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
                        <h2 style={{ fontWeight: 200 }}>Relatório de Código de Barras</h2>
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

                <GradeDeCartoes dados={this.state.dados} />
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
export default Form.create()(RelatorioCodigoBarrasScreen)
