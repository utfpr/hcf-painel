import React from 'react'

import {
  Card, Col, Form, Input, Row
} from 'ant6'
import {
  Controller, type Control, type UseFormHandleSubmit
} from 'react-hook-form'

import SearchActionRow from '@/features/taxonomia-shared/components/SearchActionRow'

import type { FamiliaSearchFormValues } from '../types'

export interface FamiliaSearchPanelProps {
  control: Control<FamiliaSearchFormValues>
  handleSubmit: UseFormHandleSubmit<FamiliaSearchFormValues>
  onSearch: (values: FamiliaSearchFormValues) => void | Promise<void>
  onClear: () => void | Promise<void>
  total?: number
}

const FamiliaSearchPanel: React.FC<FamiliaSearchPanelProps> = ({
  control,
  handleSubmit,
  onSearch,
  onClear,
  total
}) => (
  <Card title="Buscar família">
    <form onSubmit={handleSubmit(onSearch)}>
      <Row gutter={8}>
        <Col span={24}>
          <span>Nome da família:</span>
        </Col>
      </Row>
      <Row gutter={8}>
        <Col span={24}>
          <Controller
            name="familia"
            control={control}
            render={({ field }) => (
              <Form.Item>
                <Input {...field} placeholder="Passiflora edulis" type="text" />
              </Form.Item>
            )}
          />
        </Col>
      </Row>

      <SearchActionRow onClear={onClear} total={total} />
    </form>
  </Card>
)

export default FamiliaSearchPanel
