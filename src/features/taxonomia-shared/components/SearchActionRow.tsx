import React from 'react'

import {
  Button, Col, Form, Row
} from 'ant6'

import TotalRecordFound from '@/components/TotalRecordsFound'

export interface SearchActionRowProps {
  onClear: () => void | Promise<void>
  /** When omitted, total count is not shown (e.g. taxonomia screen search). */
  total?: number
}

const SearchActionRow: React.FC<SearchActionRowProps> = ({ onClear, total }) => (
  <Row style={{ marginTop: 32 }}>
    <Col span={24}>
      <Row align="middle" justify="end" gutter={16}>
        {total !== undefined
          ? (
            <Col xs={24} sm={8} md={12} lg={16} xl={16}>
              <TotalRecordFound total={total} />
            </Col>
          )
          : null}
        <Col xs={24} sm={8} md={6} lg={4} xl={4}>
          <Form.Item>
            <Button
              type="default"
              onClick={() => {
                void onClear()
              }}
              className="login-form-button"
            >
              Limpar
            </Button>
          </Form.Item>
        </Col>
        <Col xs={24} sm={8} md={6} lg={4} xl={4}>
          <Form.Item>
            <Button type="primary" htmlType="submit" className="login-form-button">
              Pesquisar
            </Button>
          </Form.Item>
        </Col>
      </Row>
    </Col>
  </Row>
)

export default SearchActionRow
