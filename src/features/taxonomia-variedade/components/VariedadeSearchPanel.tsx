import React from 'react'

import {
  Card, Col, Form, Input, Row
} from 'ant6'
import {
  Controller, type Control, type UseFormHandleSubmit
} from 'react-hook-form'

import SearchActionRow from '@/features/taxonomia-shared/components/SearchActionRow'

import type { VariedadeSearchFormValues } from '../types'

export interface VariedadeSearchPanelProps {
  control: Control<VariedadeSearchFormValues>
  handleSubmit: UseFormHandleSubmit<VariedadeSearchFormValues>
  onSearch: (values: VariedadeSearchFormValues) => void | Promise<void>
  onClear: () => void | Promise<void>
  total?: number
}

const VariedadeSearchPanel: React.FC<VariedadeSearchPanelProps> = ({
  control,
  handleSubmit,
  onSearch,
  onClear,
  total
}) => (
  <Card title="Buscar variedade">
    <form onSubmit={handleSubmit(onSearch)}>
      <Row gutter={8}>
        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
          <Col span={24}>
            <span>Nome da variedade:</span>
          </Col>
          <Col span={24}>
            <Controller
              name="variedade"
              control={control}
              render={({ field }) => (
                <Form.Item>
                  <Input {...field} placeholder="A. comosus" type="text" />
                </Form.Item>
              )}
            />
          </Col>
        </Col>

        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
          <Col span={24}>
            <span>Nome da família:</span>
          </Col>
          <Col span={24}>
            <Controller
              name="familia"
              control={control}
              render={({ field }) => (
                <Form.Item>
                  <Input {...field} placeholder="Fabaceae" type="text" />
                </Form.Item>
              )}
            />
          </Col>
        </Col>

        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
          <Col span={24}>
            <span>Nome do gênero:</span>
          </Col>
          <Col span={24}>
            <Controller
              name="genero"
              control={control}
              render={({ field }) => (
                <Form.Item>
                  <Input {...field} placeholder="Chamaecrista" type="text" />
                </Form.Item>
              )}
            />
          </Col>
        </Col>

        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
          <Col span={24}>
            <span>Nome da espécie:</span>
          </Col>
          <Col span={24}>
            <Controller
              name="especie"
              control={control}
              render={({ field }) => (
                <Form.Item>
                  <Input {...field} placeholder="guianensis" type="text" />
                </Form.Item>
              )}
            />
          </Col>
        </Col>
      </Row>

      <SearchActionRow onClear={onClear} total={total} />
    </form>
  </Card>
)

export default VariedadeSearchPanel
