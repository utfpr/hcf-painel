import { Component } from 'react'

import {
    Card, Row, Col, Select, Button, DatePicker, Divider,
    Spin, notification, Empty
} from 'antd'
import axios from 'axios'
import moment from 'moment'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

import { Form } from '@ant-design/compatible'

import HeaderListComponent from '../components/HeaderListComponent'
import { baseUrl } from '../config/api'

const FormItem = Form.Item
const { Option } = Select
const { RangePicker } = DatePicker

class RelatorioPorPeriodo extends Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: false,
            dataInicio: moment().subtract(30, 'days'),
            dataFim: moment(),
            granularidade: 'dia',
            tipoGrafico: 'barras',
            dados: [],
            erro: null
        }
    }

    componentDidMount() {
        this.requisitaDados()
    }

    requisitaDados = async () => {
        const { dataInicio, dataFim, granularidade } = this.state

        if (!dataInicio || !dataFim) {
            this.openNotificationWithIcon('warning', 'Alerta', 'Selecione um período válido')
            return
        }

        if (dataInicio.isAfter(dataFim)) {
            this.openNotificationWithIcon('warning', 'Alerta', 'A data de início deve ser anterior à data de fim')
            return
        }

        this.setState({ loading: true, erro: null })

        try {
            const params = {
                data_inicio: dataInicio.format('YYYY-MM-DD'),
                data_fim: dataFim.format('YYYY-MM-DD'),
                granularidade
            }

            const response = await axios.get(`${baseUrl}/tombos/relatorio-periodo`, { params })

            if (response.status === 200) {
                const dados = response.data.map(item => ({
                    periodo: item.periodo,
                    quantidade: item.quantidade
                }))

                this.setState({
                    dados,
                    loading: false
                })
            } else {
                this.setState({
                    erro: 'Falha ao buscar dados do relatório',
                    loading: false
                })
                this.openNotificationWithIcon('error', 'Erro', 'Falha ao buscar dados do relatório')
            }
        } catch (err) {
            const { response } = err
            const mensagemErro = response?.data?.error?.message || 'Falha ao buscar dados do relatório'

            this.setState({
                erro: mensagemErro,
                loading: false
            })
            this.openNotificationWithIcon('error', 'Erro', mensagemErro)
        }
    }

    openNotificationWithIcon = (type, message, description) => {
        notification[type]({
            message,
            description
        })
    }

    getGranularidadesPermitidas = () => {
        const { dataInicio, dataFim } = this.state

        if (!dataInicio || !dataFim) {
            return ['dia', 'semana', 'mes', 'ano']
        }

        const diffMs = dataFim - dataInicio
        const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
        const diffSemanas = Math.ceil(diffDias / 7)
        const diffMeses = Math.ceil((dataFim.year() - dataInicio.year()) * 12 + (dataFim.month() - dataInicio.month()))

        const granularidades = []

        if (diffDias <= 48) {
            granularidades.push('dia')
        }
        if (diffSemanas <= 48) {
            granularidades.push('semana')
        }
        if (diffMeses <= 48) {
            granularidades.push('mes')
        }
        granularidades.push('ano')

        return granularidades
    }

    handleDateChange = dates => {
        if (dates) {
            this.setState(prevState => {
                const novoEstado = {
                    dataInicio: dates[0],
                    dataFim: dates[1]
                }

                // Verificar se a granularidade atual ainda é válida
                const granularidadesPermitidas = this.getGranularidadesPermitidas()
                if (!granularidadesPermitidas.includes(prevState.granularidade)) {
                    novoEstado.granularidade = granularidadesPermitidas[0] || 'dia'
                }

                return novoEstado
            })
        } else {
            this.setState({
                dataInicio: null,
                dataFim: null
            })
        }
    }

    handleGranularidadeChange = value => {
        this.setState({ granularidade: value })
    }

    handleTipoGraficoChange = value => {
        this.setState({ tipoGrafico: value })
    }

    renderFiltros() {
        const { dataInicio, dataFim, granularidade, tipoGrafico } = this.state
        const granularidadesPermitidas = this.getGranularidadesPermitidas()

        // Calcular diferenças para mostrar ao usuário
        let diffDias = 0
        let diffSemanas = 0
        let diffMeses = 0
        if (dataInicio && dataFim) {
            const diffMs = dataFim - dataInicio
            diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
            diffSemanas = Math.ceil(diffDias / 7)
            diffMeses = Math.ceil((dataFim.year() - dataInicio.year()) * 12 + (dataFim.month() - dataInicio.month()))
        }

        return (
            <Card title="Relatório de Tombos por Período" style={{ marginBottom: '20px' }}>
                <Form>
                    <Row gutter={16}>
                        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                            <FormItem label="Período">
                                <RangePicker
                                    value={dataInicio && dataFim ? [dataInicio, dataFim] : undefined}
                                    onChange={this.handleDateChange}
                                    format="DD/MM/YYYY"
                                    style={{ width: '100%' }}
                                    placeholder={['Data inicial', 'Data final']}
                                />
                            </FormItem>
                            {dataInicio && dataFim && (
                                <p style={{ fontSize: '12px', color: '#999', marginTop: '-15px' }}>
                                    Período:
                                    {' '}
                                    {diffDias}
                                    {' '}
                                    dias |
                                    {' '}
                                    {diffSemanas}
                                    {' '}
                                    semanas |
                                    {' '}
                                    {diffMeses}
                                    {' '}
                                    meses
                                </p>
                            )}
                        </Col>

                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <FormItem label="Granularidade">
                                <Select
                                    value={granularidade}
                                    onChange={this.handleGranularidadeChange}
                                    placeholder="Selecione a granularidade"
                                >
                                    <Option value="dia" disabled={!granularidadesPermitidas.includes('dia')}>
                                        Dia
                                        {' '}
                                        {!granularidadesPermitidas.includes('dia') ? '(máx. 48 dias)' : ''}
                                    </Option>
                                    <Option value="semana" disabled={!granularidadesPermitidas.includes('semana')}>
                                        Semana
                                        {' '}
                                        {!granularidadesPermitidas.includes('semana') ? '(máx. 48 semanas)' : ''}
                                    </Option>
                                    <Option value="mes" disabled={!granularidadesPermitidas.includes('mes')}>
                                        Mês
                                        {' '}
                                        {!granularidadesPermitidas.includes('mes') ? '(máx. 48 meses)' : ''}
                                    </Option>
                                    <Option value="ano" disabled={!granularidadesPermitidas.includes('ano')}>
                                        Ano
                                    </Option>
                                </Select>
                            </FormItem>
                        </Col>

                        <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                            <FormItem label="Tipo de Gráfico">
                                <Select
                                    value={tipoGrafico}
                                    onChange={this.handleTipoGraficoChange}
                                    placeholder="Selecione o tipo de gráfico"
                                >
                                    <Option value="barras">Gráfico de Barras</Option>
                                    <Option value="linhas">Gráfico de Linhas</Option>
                                </Select>
                            </FormItem>
                        </Col>
                    </Row>

                    <Row gutter={16} justify="end">
                        <Col xs={24} sm={12} md={6} lg={4} xl={4}>
                            <Button
                                type="primary"
                                onClick={this.requisitaDados}
                                loading={this.state.loading}
                                block
                                style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}
                            >
                                Buscar
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Card>
        )
    }

    renderGrafico() {
        const { dados, tipoGrafico, loading } = this.state

        if (loading) {
            return (
                <Card style={{ textAlign: 'center', padding: '50px' }}>
                    <Spin size="large" tip="Carregando dados..." />
                </Card>
            )
        }

        if (!dados || dados.length === 0) {
            return (
                <Card>
                    <Empty
                        description="Nenhum dado disponível"
                        style={{ marginTop: '50px' }}
                    />
                </Card>
            )
        }

        return (
            <Card
                title={tipoGrafico === 'barras' ? 'Gráfico de Barras - Tombos por Período' : 'Gráfico de Linhas - Tombos por Período'}
                style={{ marginTop: '20px' }}
            >
                <Row gutter={16}>
                    <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                        <div style={{ width: '100%', height: 400 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                {tipoGrafico === 'barras'
                                    ? (
                                            <BarChart data={dados} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis
                                                    dataKey="periodo"
                                                    angle={-45}
                                                    textAnchor="end"
                                                    height={100}
                                                />
                                                <YAxis />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                                                    formatter={value => [`${value} tombos`, 'Quantidade']}
                                                />
                                                <Legend />
                                                <Bar
                                                    dataKey="quantidade"
                                                    fill="#1890ff"
                                                    name="Quantidade de Tombos"
                                                    radius={[8, 8, 0, 0]}
                                                />
                                            </BarChart>
                                        )
                                    : (
                                            <LineChart data={dados} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis
                                                    dataKey="periodo"
                                                    angle={-45}
                                                    textAnchor="end"
                                                    height={100}
                                                />
                                                <YAxis />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                                                    formatter={value => [`${value} tombos`, 'Quantidade']}
                                                />
                                                <Legend />
                                                <Line
                                                    type="monotone"
                                                    dataKey="quantidade"
                                                    stroke="#1890ff"
                                                    name="Quantidade de Tombos"
                                                    strokeWidth={2}
                                                    dot={{ fill: '#1890ff', r: 4 }}
                                                    activeDot={{ r: 6 }}
                                                />
                                            </LineChart>
                                        )}
                            </ResponsiveContainer>
                        </div>
                    </Col>
                </Row>
            </Card>
        )
    }

    render() {
        return (
            <div>
                <Divider dashed />
                {this.renderFiltros()}
                <Divider dashed />
                {this.renderGrafico()}
            </div>
        )
    }
}

export default Form.create()(RelatorioPorPeriodo)
