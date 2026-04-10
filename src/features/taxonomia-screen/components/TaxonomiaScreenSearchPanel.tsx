import React from 'react'

import {
  Card, Col, Form, Input, Row
} from 'ant6'
import {
  Controller, type Control, type UseFormHandleSubmit
} from 'react-hook-form'

import SearchActionRow from '@/features/taxonomia-shared/components/SearchActionRow'

import type { TaxonomiaSearchFormValues } from '../types'

export interface TaxonomiaScreenSearchPanelProps {
  control: Control<TaxonomiaSearchFormValues>
  handleSubmit: UseFormHandleSubmit<TaxonomiaSearchFormValues>
  onSearch: (values: TaxonomiaSearchFormValues) => void | Promise<void>
  onClear: () => void | Promise<void>
}

const TaxonomiaScreenSearchPanel: React.FC<TaxonomiaScreenSearchPanelProps> = ({
  control,
  handleSubmit,
  onSearch,
  onClear
}) => (
  <Card title="Buscar tombo">
    <form onSubmit={handleSubmit(onSearch)}>
      <Row gutter={8}>
        <Col span={8}>
          <span>Família:</span>
        </Col>
        <Col span={8}>
          <span>Subfamília:</span>
        </Col>
        <Col span={8}>
          <span>Gênero:</span>
        </Col>
      </Row>
      <Row gutter={8}>
        <Col span={8}>
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
        <Col span={8}>
          <Controller
            name="subfamilia"
            control={control}
            render={({ field }) => (
              <Form.Item>
                <Input {...field} placeholder="Passiflora edulis" type="text" />
              </Form.Item>
            )}
          />
        </Col>
        <Col span={8}>
          <Controller
            name="genero"
            control={control}
            render={({ field }) => (
              <Form.Item>
                <Input {...field} placeholder="Passiflora edulis" type="text" />
              </Form.Item>
            )}
          />
        </Col>
      </Row>
      <Row gutter={8}>
        <Col span={8}>
          <span>Espécie:</span>
        </Col>
        <Col span={8}>
          <span>Subespécie:</span>
        </Col>
        <Col span={8}>
          <span>Variedade:</span>
        </Col>
      </Row>
      <Row gutter={8}>
        <Col span={8}>
          <Controller
            name="especie"
            control={control}
            render={({ field }) => (
              <Form.Item>
                <Input {...field} placeholder="Passiflora edulis" type="text" />
              </Form.Item>
            )}
          />
        </Col>
        <Col span={8}>
          <Controller
            name="subespecie"
            control={control}
            render={({ field }) => (
              <Form.Item>
                <Input {...field} placeholder="Passiflora edulis" type="text" />
              </Form.Item>
            )}
          />
        </Col>
        <Col span={8}>
          <Controller
            name="variedade"
            control={control}
            render={({ field }) => (
              <Form.Item>
                <Input {...field} placeholder="Passiflora edulis" type="text" />
              </Form.Item>
            )}
          />
        </Col>
      </Row>

      <SearchActionRow onClear={onClear} />
    </form>
  </Card>
)

export default TaxonomiaScreenSearchPanel
