import React from 'react'

import {
  Card, Col, Form, Input, Row
} from 'ant6'
import {
  Controller, type Control, type UseFormHandleSubmit
} from 'react-hook-form'

import SearchActionRow from '@/features/taxonomia-shared/components/SearchActionRow'

import type { GeneroSearchFormValues } from '../types'

export interface GeneroSearchPanelProps {
  control: Control<GeneroSearchFormValues>
  handleSubmit: UseFormHandleSubmit<GeneroSearchFormValues>
  onSearch: (values: GeneroSearchFormValues) => void | Promise<void>
  onClear: () => void | Promise<void>
  total?: number
}

const GeneroSearchPanel: React.FC<GeneroSearchPanelProps> = ({
  control,
  handleSubmit,
  onSearch,
  onClear,
  total
}) => (
  <Card title="Buscar gênero">
    <form onSubmit={handleSubmit(onSearch)}>
      <Row gutter={8}>
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
                  <Input {...field} placeholder="Passion Flower" type="text" />
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
      </Row>

      <SearchActionRow onClear={onClear} total={total} />
    </form>
  </Card>
)

export default GeneroSearchPanel
