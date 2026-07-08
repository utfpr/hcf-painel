import React, { useState, useEffect, useMemo } from 'react'
import { Row, Col, Spin, notification } from 'antd'
import {
    DatabaseOutlined,
    EnvironmentOutlined,
    BankOutlined,
    CameraOutlined,
    TagOutlined,
    UserOutlined
} from '@ant-design/icons'
import axios from 'axios'
import { withTranslation } from 'react-i18next'

import MetricCard from '../components/MetricCard'
import RankingCard from '../components/RankingCard'
import ComparativeAreaChart from '../components/ComparativeAreaChart'

const DashboardScreen = ({ t }) => {
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
                    message: t('common:erro'),
                    description: t('dashboardScreen:erroCarregar')
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
                    message: t('common:erro'),
                    description: t('dashboardScreen:erroCarregar')
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


    if (loadingTombo || !tomboData) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <Spin size="large" tip={t('common:carregando')} />
            </div>
        )
    }

    const { tombos, taxonomia, municipios, coletores, herbarios } = tomboData
    const anoAtualCalendario = new Date().getFullYear()

    return (
        <div style={{ padding: '24px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={8} style={{ flex: 1 }}>
                    <MetricCard
                        title={t('dashboardScreen:totalTombos')}
                        value={tombos.total}
                        prefix={<DatabaseOutlined />}
                        valueColor="#1890ff"
                    />
                </Col>
                <Col xs={24} sm={12} md={8} style={{ flex: 1 }}>
                    <MetricCard
                        title={t('dashboardScreen:internos')}
                        value={tombos.internos}
                        prefix={<EnvironmentOutlined />}
                    />
                </Col>
                <Col xs={24} sm={12} md={8} style={{ flex: 1 }}>
                    <MetricCard
                        title={t('dashboardScreen:externos')}
                        value={tombos.externos}
                        prefix={<BankOutlined />}
                    />
                </Col>
                <Col xs={24} sm={12} md={8} style={{ flex: 1 }}>
                    <MetricCard
                        title={t('dashboardScreen:fotos')}
                        value={tombos.fotos}
                        prefix={<CameraOutlined />}
                        valueColor="#722ed1"
                    />
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col span={24}>
                    {temporalData && (
                        <ComparativeAreaChart
                            loading={loadingTemporal}
                            data={chartData}
                            centerTitle={t('dashboardScreen:ano', { ano: temporalData.meta.ano_referencia })}
                            labelAtual={temporalData.meta.ano_referencia.toString()}
                            labelPassado={temporalData.meta.ano_comparacao.toString()}
                            dataKeyAtual={temporalData.meta.ano_referencia.toString()}
                            dataKeyPassado={temporalData.meta.ano_comparacao.toString()}
                            valorAtual={temporalData.serie_temporal.totais.atual}
                            valorPassado={temporalData.serie_temporal.totais.passado}
                            variacaoPorcentagem={temporalData.serie_temporal.totais.porcentagem}
                            onBack={() => setSelectedYear(prev => prev - 1)}
                            onForward={() => setSelectedYear(prev => prev + 1)}
                            disableForward={selectedYear >= anoAtualCalendario}
                        />
                    )}
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} lg={8}>
                    <RankingCard titulo={t('dashboardScreen:topFamilias')} icone={<TagOutlined style={{ color: '#13c2c2' }} />} dadosRanking={taxonomia.familias} />
                </Col>
                <Col xs={24} lg={8}>
                    <RankingCard titulo={t('dashboardScreen:topGeneros')} icone={<TagOutlined style={{ color: '#eb2f96' }} />} dadosRanking={taxonomia.generos} />
                </Col>
                <Col xs={24} lg={8}>
                    <RankingCard titulo={t('dashboardScreen:topEspecies')} icone={<TagOutlined style={{ color: '#fa8c16' }} />} dadosRanking={taxonomia.especies} />
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={8}>
                    <RankingCard titulo={t('dashboardScreen:topColetores')} icone={<UserOutlined style={{ color: '#2f54eb' }} />} dadosRanking={coletores} />
                </Col>
                <Col xs={24} lg={8}>
                    <RankingCard titulo={t('dashboardScreen:topMunicipios')} icone={<EnvironmentOutlined style={{ color: '#fa541c' }} />} dadosRanking={municipios} />
                </Col>
                <Col xs={24} lg={8}>
                    <RankingCard titulo={t('dashboardScreen:topHerbarios')} icone={<BankOutlined style={{ color: '#722ed1' }} />} dadosRanking={herbarios} />
                </Col>
            </Row>
        </div>
    )
}

export default withTranslation()(DashboardScreen)
