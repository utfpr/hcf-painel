import React from 'react'

import {
  Button, Col, Row
} from 'ant6'

import { PlusOutlined } from '@ant-design/icons'

const addButtonStyle: React.CSSProperties = {
  backgroundColor: '#5CB85C',
  borderColor: '#5CB85C',
  width: '100%'
}

export interface TaxonomiaListHeaderProps {
  title: string
  canEdit: boolean
  onAdd: () => void
}

const TaxonomiaListHeader: React.FC<TaxonomiaListHeaderProps> = ({
  title,
  canEdit,
  onAdd
}) => (
  <Row gutter={24} style={{ marginBottom: '20px' }}>
    <Col xs={24} sm={14} md={18} lg={20} xl={20}>
      <h2 style={{ fontWeight: 200 }}>{title}</h2>
    </Col>
    <Col xs={24} sm={10} md={6} lg={4} xl={4}>
      {canEdit
        ? (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onAdd}
            style={addButtonStyle}
          >
            Adicionar
          </Button>
        )
        : null}
    </Col>
  </Row>
)

export default TaxonomiaListHeader
