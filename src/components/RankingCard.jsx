import React from 'react'
import { Card, List, Progress, Typography } from 'antd'

const { Text } = Typography

const RankingCard = ({ titulo, icone, dadosRanking }) => {
    if (!dadosRanking || !dadosRanking.ranking) return null

    const maxValor = dadosRanking.ranking.length > 0 ? dadosRanking.ranking[0].total : 1

    const formatadorK = (value) => {
        return new Intl.NumberFormat('pt-BR').format(value)
    }

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

export default RankingCard
