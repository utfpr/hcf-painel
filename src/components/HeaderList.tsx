import {
  Button, Col, Row
} from 'antd6'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { PlusOutlined } from '@ant-design/icons'

export interface HeaderListProps {
  title: string
  addTo?: string
  canAdd?: boolean
}

export function HeaderList({
  title, addTo, canAdd = true
}: HeaderListProps) {
  const { t } = useTranslation()

  return (
    <Row gutter={24} style={{ marginBottom: 20 }}>
      <Col
        xs={24}
        sm={12}
        md={16}
        lg={20}
        xl={20}
      >
        <h2 style={{ fontWeight: 200 }}>{title}</h2>
      </Col>
      <Col
        xs={24}
        sm={12}
        md={8}
        lg={4}
        xl={4}
      >
        {addTo && canAdd && (
          <Link to={addTo}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={{ width: '100%' }}
            >
              {t('common:adicionar')}
            </Button>
          </Link>
        )}
      </Col>
    </Row>
  )
}
