import React from 'react'

import {
  Card, Col, Form, Input, Row
} from 'ant6'
import {
  Controller, type Control, type UseFormHandleSubmit
} from 'react-hook-form'

import SearchActionRow from '@/features/taxonomia-shared/components/SearchActionRow'

import type { AutorSearchFormValues } from '../types'

export interface AutorSearchPanelProps {
  control: Control<AutorSearchFormValues>
  handleSubmit: UseFormHandleSubmit<AutorSearchFormValues>
  onSearch: (values: AutorSearchFormValues) => void | Promise<void>
  onClear: () => void | Promise<void>
  total?: number
}

const AutorSearchPanel: React.FC<AutorSearchPanelProps> = ({
  control,
  handleSubmit,
  onSearch,
  onClear,
  total
}) => (
  <Card title="Buscar autor">
    <form onSubmit={handleSubmit(onSearch)}>
      <Row gutter={8}>
        <Col span={24}>
          <span>Nome do autor:</span>
        </Col>
      </Row>
      <Row gutter={8}>
        <Col span={24}>
          <Controller
            name="autor"
            control={control}
            render={({ field }) => (
              <Form.Item>
                <Input {...field} placeholder="Bob Lee" type="text" />
              </Form.Item>
            )}
          />
        </Col>
      </Row>

      <SearchActionRow onClear={onClear} total={total} />
    </form>
  </Card>
)

export default AutorSearchPanel
