import React, { useState, useEffect, useMemo } from 'react'
import {
    Row,
    Col,
    Card,
    Statistic,
    Spin,
    notification,
    Tabs,
    List,
    Progress,
    Typography
} from 'antd'
import {
    DatabaseOutlined,
    BookOutlined,
    EnvironmentOutlined,
    UserOutlined,
    BankOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
    TagOutlined
} from '@ant-design/icons'
import axios from 'axios'
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend
} from 'recharts'

const { TabPane } = Tabs
const { Text } = Typography

const DashboardScreen = () => {
    const [loading, setLoading] = useState(true)
    const [dashboardData, setDashboardData] = useState(null)
    const [timeTab, setTimeTab] = useState('semana')

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        setLoading(true)
        try {
            const response = await axios.get('/dashboard')
            if (response.status === 200) {
                setDashboardData(response.data.dados)
            }
        } catch (error) {
            notification.error({
                message: 'Erro no Dashboard',
                description: 'Não foi possível carregar os dados do painel, tente novamente mais tarde.'
            })
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const chartData = useMemo(() => {
        if (!dashboardData) return []

        const serie = dashboardData.serie_temporal[timeTab]
        const atual = serie.dados.atual
        const passado = serie.dados.passada || serie.dados.passado 

        return atual.map((item, index) => ({
            name: item.dia || item.semana || item.mes,
            Atual: item.total,
            Anterior: passado[index] ? passado[index].total : 0
        }))

    }, [dashboardData, timeTab])

    const formatadorK = (value) => {
        return new Intl.NumberFormat('pt-BR').format(value)
    }

    const renderChartHeader = () => {
        if (!dashboardData) return null
        const totais = dashboardData.serie_temporal[timeTab].totais
        const isPositivo = totais.porcentagem >= 0

        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '16px' }}>
                <Statistic 
                    title="Período Atual" 
                    value={totais.atual} 
                    valueStyle={{ fontWeight: 'bold' }} 
                />
                <Statistic 
                    title="Período Anterior" 
                    value={totais.passado || totais.passada} 
                    valueStyle={{ color: '#8c8c8c' }} 
                />
                <Statistic
                    title="Variação"
                    value={Math.abs(totais.porcentagem)}
                    precision={2}
                    valueStyle={{ color: isPositivo ? '#3f8600' : '#cf1322' }}
                    prefix={isPositivo ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                    suffix="%"
                />
            </div>
        )
    }

    const renderRankingList = (titulo, icone, dadosRanking) => {
        if (!dadosRanking) return null
        const maxValor = dadosRanking.ranking.length > 0 ? dadosRanking.ranking[0].total : 1

        return (
            <Card 
                title={<><span style={{ marginRight: 8 }}>{icone}</span>{titulo}</>} 
                bordered={false}
                extra={<Text type="secondary">Total: {formatadorK(dadosRanking.total)}</Text>}
                style={{ height: '100%' }}
                bodyStyle={{ padding: '12px 24px' }}
            >
                <List
                    itemLayout="horizontal"
                    dataSource={dadosRanking.ranking}
                    renderItem={(item, index) => {
                        const percent = (item.total / maxValor) * 100
                        return (
                            <List.Item style={{ borderBottom: 'none', padding: '8px 0' }}>
                                <div style={{ width: '100%' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                        <Text 
                                            strong 
                                            style={{ flex: 1, minWidth: 0, marginRight: '16px' }} 
                                            ellipsis={{ tooltip: item.nome }}
                                        >
                                            {index + 1}. {item.nome}
                                        </Text>
                                        <Text type="secondary" style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
                                            {formatadorK(item.total)}
                                        </Text>

                                    </div>
                                    <Progress 
                                        percent={percent} 
                                        showInfo={false} 
                                        strokeColor="#1890ff"
                                        trailColor="#f5f5f5"
                                        size="small"
                                    />
                                </div>
                            </List.Item>
                        )
                    }}
                />
            </Card>
        )
    }

    if (loading || !dashboardData) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <Spin size="large" tip="Carregando..." />
            </div>
        )
    }

    const { tombos, taxonomia, municipios, coletores, herbarios } = dashboardData

    return (
        <div style={{ padding: '24px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false}>
                        <Statistic
                            title="Total de Tombos"
                            value={tombos.total}
                            valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
                            prefix={<DatabaseOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false}>
                        <Statistic
                            title="Tombados"
                            value={tombos.tombados}
                            valueStyle={{ color: '#52c41a' }}
                            prefix={<BookOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false}>
                        <Statistic
                            title="Internos"
                            value={tombos.internos}
                            prefix={<BankOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false}>
                        <Statistic
                            title="Externos"
                            value={tombos.externos}
                            prefix={<EnvironmentOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col span={24}>
                    <Card bordered={false}>
                        <Tabs 
                            activeKey={timeTab} 
                            onChange={(key) => setTimeTab(key)}
                            tabBarExtraContent={renderChartHeader()}
                        >
                            <TabPane tab="Última Semana" key="semana" />
                            <TabPane tab="Último Mês" key="mes" />
                            <TabPane tab="Este Ano" key="ano" />
                        </Tabs>

                        <div style={{ height: 350, width: '100%', marginTop: 16 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorAtual" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#1890ff" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#1890ff" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorAnterior" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#d9d9d9" stopOpacity={0.5}/>
                                            <stop offset="95%" stopColor="#d9d9d9" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8c8c8c' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8c8c8c' }} />
                                    <RechartsTooltip 
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Legend verticalAlign="top" height={36}/>
                                    <Area type="monotone" dataKey="Anterior" stroke="#bfbfbf" fillOpacity={1} fill="url(#colorAnterior)" />
                                    <Area type="monotone" dataKey="Atual" stroke="#1890ff" strokeWidth={2} fillOpacity={1} fill="url(#colorAtual)" activeDot={{ r: 6 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} lg={8}>
                    {renderRankingList('Top Famílias', <TagOutlined style={{ color: '#13c2c2' }}/>, taxonomia.familias)}
                </Col>
                <Col xs={24} lg={8}>
                    {renderRankingList('Top Gêneros', <TagOutlined style={{ color: '#eb2f96' }}/>, taxonomia.generos)}
                </Col>
                <Col xs={24} lg={8}>
                    {renderRankingList('Top Espécies', <TagOutlined style={{ color: '#fa8c16' }}/>, taxonomia.especies)}
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={8}>
                    {renderRankingList('Top Coletores', <UserOutlined style={{ color: '#2f54eb' }}/>, coletores)}
                </Col>
                <Col xs={24} lg={8}>
                    {renderRankingList('Top Municípios', <EnvironmentOutlined style={{ color: '#fa541c' }}/>, municipios)}
                </Col>
                <Col xs={24} lg={8}>
                    {renderRankingList('Top Herbários', <BankOutlined style={{ color: '#722ed1' }}/>, herbarios)}
                </Col>
            </Row>

        </div>
    )
}

export default DashboardScreen
