import React from 'react'
import { Card, Statistic, Spin, Button, Space, Typography } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons'
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
    CartesianGrid, Tooltip as RechartsTooltip, Legend
} from 'recharts'

const { Title } = Typography

const ComparativeAreaChart = ({
    loading,
    data,
    centerTitle,
    labelAtual,
    labelPassado,
    dataKeyAtual,
    dataKeyPassado,
    valorAtual,
    valorPassado,
    variacaoPorcentagem,
    onBack,
    onForward,
    disableForward
}) => {
    const isPositivo = variacaoPorcentagem >= 0

    return (
        <Card bordered={false}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <Space size="middle">
                    <Button icon={<LeftOutlined />} onClick={onBack} disabled={loading} />
                    <Title level={3} style={{ margin: 0, minWidth: '150px', textAlign: 'center' }}>
                        {centerTitle}
                    </Title>
                    <Button icon={<RightOutlined />} onClick={onForward} disabled={loading || disableForward} />
                </Space>

                <div style={{ display: 'flex', gap: '24px' }}>
                    <Statistic title={`Total ${labelAtual}`} value={valorAtual} valueStyle={{ fontWeight: 'bold' }} />
                    <Statistic title={`Total ${labelPassado}`} value={valorPassado} valueStyle={{ color: '#8c8c8c' }} />
                    <Statistic
                        title="Variação"
                        value={Math.abs(variacaoPorcentagem)}
                        precision={2}
                        valueStyle={{ color: isPositivo ? '#3f8600' : '#cf1322' }}
                        prefix={isPositivo ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                        suffix="%"
                    />
                </div>
            </div>

            <div style={{ height: 350, width: '100%', marginTop: 16, position: 'relative' }}>
                {loading && (
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(255,255,255,0.7)', zIndex: 10,
                        display: 'flex', justifyContent: 'center', alignItems: 'center'
                    }}>
                        <Spin size="large" />
                    </div>
                )}
                
                {!loading && data && data.length > 0 && (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                            <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                            <Legend verticalAlign="top" height={36} />
                            
                            <Area
                                name={labelPassado}
                                type="monotone"
                                dataKey={dataKeyPassado}
                                stroke="#bfbfbf" fillOpacity={1} fill="url(#colorAnterior)"
                            />
                            <Area
                                name={labelAtual}
                                type="monotone"
                                dataKey={dataKeyAtual}
                                stroke="#1890ff" strokeWidth={2} fillOpacity={1} fill="url(#colorAtual)" activeDot={{ r: 6 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </Card>
    )
}

export default ComparativeAreaChart
