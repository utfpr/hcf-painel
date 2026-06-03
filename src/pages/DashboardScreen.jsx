import React, { useState, useEffect, useMemo } from 'react'
import {
    Row,
    Col,
    Card,
    Statistic,
    Spin,
    notification,
    List,
    Progress,
    Typography,
    Button,
    Space
} from 'antd'
import {
    DatabaseOutlined,
    BookOutlined,
    EnvironmentOutlined,
    UserOutlined,
    BankOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
    TagOutlined,
    LeftOutlined,
    RightOutlined,
    CameraOutlined
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

const { Text, Title } = Typography

const DashboardScreen = () => {
    const [loadingTombo, setLoadingTombo] = useState(true)
    const [tomboData, setTomboData] = useState(null)

    const [loadingTemporal, setLoadingTemporal] = useState(true)
    const [temporalData, setTemporalData] = useState(null)

    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

    useEffect(() => {
        const fetchTomboData = async () => {
            try {
                const response = await axios.get('/analise/tombo')
                if (response.status === 200) {
                    setTomboData(response.data.dados)
                }
            } catch (error) {
                notification.error({
                    message: 'Erro',
                    description: 'Não foi possível carregar as informações, tente novamente mais tarde.'
                })
            } finally {
                setLoadingTombo(false)
            }
        }

        fetchTomboData()
    }, [])

    useEffect(() => {
        const fetchTemporalData = async () => {
            setLoadingTemporal(true)
            try {
                const response = await axios.get(`/analise/temporal?ano=${selectedYear}`)
                if (response.status === 200) {
                    setTemporalData(response.data)
                }
            } catch (error) {
                notification.error({
                    message: 'Erro',
                    description: 'Não foi possível carregar as informações, tente novamente mais tarde.'
                })
            } finally {
                setLoadingTemporal(false)
            }
        }

        fetchTemporalData()
    }, [selectedYear])

    const chartData = useMemo(() => {
        if (!temporalData) return []

        const { atual, passado } = temporalData.serie_temporal.dados
        const { ano_referencia, ano_comparacao } = temporalData.meta

        return atual.map((item, index) => ({
            name: item.mes,
            [ano_referencia.toString()]: item.total,
            [ano_comparacao.toString()]: passado[index] ? passado[index].total : 0
        }))
    }, [temporalData])

    const formatadorK = (value) => {
        return new Intl.NumberFormat('pt-BR').format(value)
    }

    const renderChartHeader = () => {
        if (!temporalData) return null

        const { totais } = temporalData.serie_temporal
        const { ano_referencia, ano_comparacao } = temporalData.meta
        const isPositivo = totais.porcentagem >= 0
        const anoAtualCalendario = new Date().getFullYear()

        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <Space size="middle">
                    <Button
                        icon={<LeftOutlined />}
                        onClick={() => setSelectedYear(prev => prev - 1)}
                        disabled={loadingTemporal}
                    />
                    <Title level={3} style={{ margin: 0, minWidth: '150px', textAlign: 'center' }}>
                        Ano {ano_referencia}
                    </Title>
                    <Button
                        icon={<RightOutlined />}
                        onClick={() => setSelectedYear(prev => prev + 1)}
                        disabled={loadingTemporal || selectedYear >= anoAtualCalendario}
                    />
                </Space>

                <div style={{ display: 'flex', gap: '24px' }}>
                    <Statistic
                        title={`Total ${ano_referencia}`}
                        value={totais.atual}
                        valueStyle={{ fontWeight: 'bold' }}
                    />
                    <Statistic
                        title={`Total ${ano_comparacao}`}
                        value={totais.passado}
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

    if (loadingTombo || !tomboData) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <Spin size="large" tip="Carregando..." />
            </div>
        )
    }

    const { tombos, taxonomia, municipios, coletores, herbarios } = tomboData

    return (
        <div style={{ padding: '24px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={8} style={{ flex: 1 }}>
                    <Card bordered={false}>
                        <Statistic
                            title="Total de Tombos"
                            value={tombos.total}
                            valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
                            prefix={<DatabaseOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} style={{ flex: 1 }}>
                    <Card bordered={false}>
                        <Statistic
                            title="Internos"
                            value={tombos.internos}
                            prefix={<EnvironmentOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} style={{ flex: 1 }}>
                    <Card bordered={false}>
                        <Statistic
                            title="Externos"
                            value={tombos.externos}
                            prefix={<BankOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} style={{ flex: 1 }}>
                    <Card bordered={false}>
                        <Statistic
                            title="Fotos"
                            value={tombos.fotos}
                            valueStyle={{ color: '#722ed1' }}
                            prefix={<CameraOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col span={24}>
                    <Card bordered={false}>
                        {renderChartHeader()}
                        <div style={{ height: 350, width: '100%', marginTop: 16, position: 'relative' }}>
                            {loadingTemporal && (
                                <div style={{
                                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                    backgroundColor: 'rgba(255,255,255,0.7)', zIndex: 10,
                                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                                }}>
                                    <Spin size="large" />
                                </div>
                            )}
                            {!loadingTemporal && temporalData && (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorAtual" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#1890ff" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#1890ff" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorAnterior" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#d9d9d9" stopOpacity={0.5} />
                                                <stop offset="95%" stopColor="#d9d9d9" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8c8c8c' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8c8c8c' }} />
                                        <RechartsTooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        />
                                        <Legend verticalAlign="top" height={36} />
                                        <Area
                                            name={`${temporalData.meta.ano_comparacao}`}
                                            type="monotone"
                                            dataKey={temporalData.meta.ano_comparacao.toString()}
                                            stroke="#bfbfbf" fillOpacity={1} fill="url(#colorAnterior)"
                                        />
                                        <Area
                                            name={`${temporalData.meta.ano_referencia}`}
                                            type="monotone"
                                            dataKey={temporalData.meta.ano_referencia.toString()}
                                            stroke="#1890ff" strokeWidth={2} fillOpacity={1} fill="url(#colorAtual)" activeDot={{ r: 6 }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </Card>
                </Col>
            </Row>
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} lg={8}>
                    {renderRankingList('Top Famílias', <TagOutlined style={{ color: '#13c2c2' }} />, taxonomia.familias)}
                </Col>
                <Col xs={24} lg={8}>
                    {renderRankingList('Top Gêneros', <TagOutlined style={{ color: '#eb2f96' }} />, taxonomia.generos)}
                </Col>
                <Col xs={24} lg={8}>
                    {renderRankingList('Top Espécies', <TagOutlined style={{ color: '#fa8c16' }} />, taxonomia.especies)}
                </Col>
            </Row>
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={8}>
                    {renderRankingList('Top Coletores', <UserOutlined style={{ color: '#2f54eb' }} />, coletores)}
                </Col>
                <Col xs={24} lg={8}>
                    {renderRankingList('Top Municípios', <EnvironmentOutlined style={{ color: '#fa541c' }} />, municipios)}
                </Col>
                <Col xs={24} lg={8}>
                    {renderRankingList('Top Herbários', <BankOutlined style={{ color: '#722ed1' }} />, herbarios)}
                </Col>
            </Row>
        </div>
    )
}

export default DashboardScreen
