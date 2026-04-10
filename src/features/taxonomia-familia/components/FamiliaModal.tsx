import React from 'react'

import {
  Col, Form, Input, Modal, Row, Select, Spin
} from 'ant6'
import { Controller, type Control } from 'react-hook-form'

import TaxonomiaModalFooter from '@/features/taxonomia-shared/components/TaxonomiaModalFooter'

import type { FamiliaFormValues, ReinoOption } from '../types'

export interface FamiliaModalProps {
  open: boolean
  title: string
  loading: boolean
  editingId: number | string
  control: Control<FamiliaFormValues>
  reinos: ReinoOption[]
  fetchingReinos: boolean
  onCancel: () => void
  onSubmit: () => void | Promise<void>
  onSearchReinos: (text: string) => void
}

const FamiliaModal: React.FC<FamiliaModalProps> = ({
  open,
  title,
  loading,
  editingId,
  control,
  reinos,
  fetchingReinos,
  onCancel,
  onSubmit,
  onSearchReinos
}) => {
  const isEdit = editingId !== -1

  return (
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
          <span>Nome do reino:</span>
        </Col>
      </Row>
      <Row gutter={8}>
        <Col span={24}>
          <Controller
            name="reinoId"
            control={control}
            render={({ field }) => (
              <Form.Item>
                <Select
                  placeholder="Selecione um reino"
                  allowClear
                  showSearch
                  disabled={isEdit}
                  loading={fetchingReinos}
                  notFoundContent={fetchingReinos ? <Spin size="small" /> : 'Nenhum resultado encontrado'}
                  optionFilterProp="label"
                  style={{ width: '100%' }}
                  value={field.value === undefined || field.value === '' ? undefined : field.value}
                  onChange={field.onChange}
                  onSearch={onSearchReinos}
                  options={reinos.map(r => ({
                    value: r.id,
                    label: r.nome
                  }))}
                />
              </Form.Item>
            )}
          />
        </Col>
      </Row>

      <Row gutter={8} style={{ marginTop: 16 }}>
        <Col span={24}>
          <span>Informe o nome da família:</span>
        </Col>
      </Row>
      <Row gutter={8}>
        <Col span={24}>
          <Controller
            name="nome"
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
}

export default FamiliaModal
