import React from 'react'
import { Card, Statistic } from 'antd'

interface MetricCardProps {
    title: string | React.ReactNode
    value: string | number
    prefix?: React.ReactNode
    valueColor?: string
}
 const MetricCard: React.FC<MetricCardProps> = ({ title, value, prefix, valueColor }) => {
    return (
        <Card bordered={false} style={{ height: '100%' }}>
            <Statistic
                title={title}
                value={value}
                valueStyle={{ 
                    color: valueColor || 'inherit', 
                    fontWeight: valueColor ? 'bold' : 'normal' 
                }}
                prefix={prefix}
            />
        </Card>
    )
}

export default MetricCard
