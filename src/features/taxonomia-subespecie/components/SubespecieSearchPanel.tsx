import React from 'react'

import {
  Card, Col, Form, Input, Row
} from 'ant6'
import {
  Controller, type Control, type UseFormHandleSubmit
} from 'react-hook-form'

import SearchActionRow from '@/features/taxonomia-shared/components/SearchActionRow'

import type { SubespecieSearchFormValues } from '../types'

export interface SubespecieSearchPanelProps {
  control: Control<SubespecieSearchFormValues>
  handleSubmit: UseFormHandleSubmit<SubespecieSearchFormValues>
  onSearch: (values: SubespecieSearchFormValues) => void | Promise<void>
  onClear: () => void | Promise<void>
  total?: number
}

const SubespecieSearchPanel: React.FC<SubespecieSearchPanelProps> = ({
  control,
  handleSubmit,
  onSearch,
  onClear,
  total
}) => (
  <Card title="Buscar subespécie">
    <form onSubmit={handleSubmit(onSearch)}>
      <Row gutter={8}>
        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
          <Col span={24}>
            <span>Nome da subespécie:</span>
          </Col>
          <Col span={24}>
            <Controller
              name="subespecie"
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

export default SubespecieSearchPanel
