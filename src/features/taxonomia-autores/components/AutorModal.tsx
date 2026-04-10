import React from 'react'

import {
  Col, Form, Input, Modal, Row
} from 'ant6'
import { Controller, type Control } from 'react-hook-form'

import TaxonomiaModalFooter from '@/features/taxonomia-shared/components/TaxonomiaModalFooter'

import type { AutorFormValues } from '../types'

export interface AutorModalProps {
  open: boolean
  title: string
  loading: boolean
  control: Control<AutorFormValues>
  onCancel: () => void
  onSubmit: () => void | Promise<void>
}

const AutorModal: React.FC<AutorModalProps> = ({
  open,
  title,
  loading,
  control,
  onCancel,
  onSubmit
}) => (
  <Modal
    open={open}
    title={title}
    onCancel={onCancel}
    styles={{ header: { background: 'transparent' } }}
    footer={(
      <TaxonomiaModalFooter
        title={title}
        loading={loading}
        onCancel={onCancel}
        onSubmit={onSubmit}
      />
    )}
    destroyOnClose
  >
    <Row gutter={8} style={{ marginTop: 16 }}>
      <Col span={24}>
        <span>Nome:</span>
      </Col>
    </Row>
    <Row gutter={8}>
      <Col span={24}>
        <Controller
          name="nome"
          control={control}
          render={({ field }) => (
            <Form.Item>
              <Input {...field} placeholder="Candance" type="text" />
            </Form.Item>
          )}
        />
      </Col>
    </Row>

    <Row gutter={8} style={{ marginTop: 16 }}>
      <Col span={24}>
        <span>Observação:</span>
      </Col>
    </Row>
    <Row gutter={8}>
      <Col span={24}>
        <Controller
          name="observacao"
          control={control}
          render={({ field }) => (
            <Form.Item>
              <Input {...field} placeholder="B.L" type="text" />
            </Form.Item>
          )}
        />
      </Col>
    </Row>
  </Modal>
)

export default AutorModal
