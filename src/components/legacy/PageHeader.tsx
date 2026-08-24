import type { ReactNode } from 'react'

import { Col, Row } from 'antd6'

export interface PageHeaderProps {
  title: string
  children?: ReactNode
}

export function PageHeader({ title, children }: PageHeaderProps) {
  return (
    <Row
      gutter={24}
      justify="space-between"
      align="middle"
      style={{ marginBottom: 20 }}
    >
      <Col flex="auto">
        <h2 style={{ fontWeight: 200 }}>{title}</h2>
      </Col>
      <Col flex="none">{children}</Col>
    </Row>
  )
}
