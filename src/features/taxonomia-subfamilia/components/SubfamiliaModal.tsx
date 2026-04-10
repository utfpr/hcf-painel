import React from 'react'

import {
  Col, Form, Input, Modal, Row, Select, Spin
} from 'ant6'
import { Controller, type Control } from 'react-hook-form'

import TaxonomiaModalFooter from '@/features/taxonomia-shared/components/TaxonomiaModalFooter'

import type {
  FamiliaOption, SubfamiliaFormValues, ReinoOption
} from '../types'

export interface SubfamiliaModalProps {
  open: boolean
  title: string
  loading: boolean
  control: Control<SubfamiliaFormValues>
  reinos: ReinoOption[]
  familias: FamiliaOption[]
  fetchingReinos: boolean
  fetchingFamilias: boolean
  reinoSelecionado: number | string | null
  onCancel: () => void
  onSubmit: () => void | Promise<void>
  onSearchReinos: (text: string) => void
  onSearchFamilias: (text: string) => void
  onReinoChange: (reinoId: number | string | undefined) => void
}

const SubfamiliaModal: React.FC<SubfamiliaModalProps> = ({
  open,
  title,
  loading,
  control,
  reinos,
  familias,
  fetchingReinos,
  fetchingFamilias,
  reinoSelecionado,
  onCancel,
  onSubmit,
  onSearchReinos,
  onSearchFamilias,
  onReinoChange
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
                loading={fetchingReinos}
                notFoundContent={fetchingReinos ? <Spin size="small" /> : 'Nenhum resultado encontrado'}
                optionFilterProp="label"
                style={{ width: '100%' }}
                value={field.value === undefined || field.value === '' ? undefined : field.value}
                onChange={value => {
                  field.onChange(value)
                  onReinoChange(value)
                }}
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
        <span>Nome da família:</span>
      </Col>
    </Row>
    <Row gutter={8}>
      <Col span={24}>
        <Controller
          name="familiaId"
          control={control}
          render={({ field }) => (
            <Form.Item>
              <Select
                placeholder={reinoSelecionado ? 'Selecione uma família' : 'Selecione um reino primeiro'}
                allowClear
                showSearch
                disabled={!reinoSelecionado}
                loading={fetchingFamilias}
                notFoundContent={fetchingFamilias ? <Spin size="small" /> : 'Nenhum resultado encontrado'}
                optionFilterProp="label"
                style={{ width: '100%' }}
                value={field.value === undefined || field.value === '' ? undefined : field.value}
                onChange={field.onChange}
                onSearch={onSearchFamilias}
                options={familias.map(f => ({
                  value: f.id,
                  label: f.nome
                }))}
              />
            </Form.Item>
          )}
        />
      </Col>
    </Row>

    <Row gutter={8} style={{ marginTop: 16 }}>
      <Col span={24}>
        <span>Nome da subfamília:</span>
      </Col>
    </Row>
    <Row gutter={8}>
      <Col span={24}>
        <Controller
          name="nomeSubfamilia"
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

export default SubfamiliaModal
