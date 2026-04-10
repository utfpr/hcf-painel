import React from 'react'

import {
  Card, Col, Form, Input, Row
} from 'ant6'
import {
  Controller, type Control, type UseFormHandleSubmit
} from 'react-hook-form'

import SearchActionRow from '@/features/taxonomia-shared/components/SearchActionRow'

import type { ReinoSearchFormValues } from '../types'

export interface ReinoSearchPanelProps {
  control: Control<ReinoSearchFormValues>
  handleSubmit: UseFormHandleSubmit<ReinoSearchFormValues>
  onSearch: (values: ReinoSearchFormValues) => void | Promise<void>
  onClear: () => void | Promise<void>
  total?: number
}

const ReinoSearchPanel: React.FC<ReinoSearchPanelProps> = ({
  control,
  handleSubmit,
  onSearch,
  onClear,
  total
}) => (
  <Card title="Buscar reino">
    <form onSubmit={handleSubmit(onSearch)}>
      <Row gutter={8}>
        <Col span={24}>
          <span>Nome do reino:</span>
        </Col>
      </Row>
      <Row gutter={8}>
        <Col span={24}>
          <Controller
            name="reino"
            control={control}
            render={({ field }) => (
              <Form.Item>
                <Input {...field} placeholder="Plantae" type="text" />
              </Form.Item>
            )}
          />
        </Col>
      </Row>

      <SearchActionRow onClear={onClear} total={total} />
    </form>
  </Card>
)

export default ReinoSearchPanel
