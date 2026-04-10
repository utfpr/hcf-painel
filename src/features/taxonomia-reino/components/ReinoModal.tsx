import React from 'react'

import {
  Col, Form, Input, Modal, Row
} from 'ant6'
import { Controller, type Control } from 'react-hook-form'

import TaxonomiaModalFooter from '@/features/taxonomia-shared/components/TaxonomiaModalFooter'

import type { ReinoFormValues } from '../types'

export interface ReinoModalProps {
  open: boolean
  title: string
  loading: boolean
  control: Control<ReinoFormValues>
  onCancel: () => void
  onSubmit: () => void | Promise<void>
}

const ReinoModal: React.FC<ReinoModalProps> = ({
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
        <span>Informe o nome do reino:</span>
      </Col>
    </Row>
    <Row gutter={8}>
      <Col span={24}>
        <Controller
          name="reinoName"
          control={control}
          render={({ field }) => (
            <Form.Item>
              <Input {...field} placeholder="" type="text" />
            </Form.Item>
          )}
        />
      </Col>
    </Row>
  </Modal>
)

export default ReinoModal
