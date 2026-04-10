import React from 'react'

import {
  Col, Form, Input, Modal, Row, Select, Spin
} from 'ant6'
import { Controller, type Control } from 'react-hook-form'

import TaxonomiaModalFooter from '@/features/taxonomia-shared/components/TaxonomiaModalFooter'

import type {
  AutorOption,
  EspecieFormValues,
  FamiliaOption,
  GeneroOption,
  ReinoOption
} from '../types'

export interface EspecieModalProps {
  open: boolean
  title: string
  loading: boolean
  control: Control<EspecieFormValues>
  reinos: ReinoOption[]
  familias: FamiliaOption[]
  generos: GeneroOption[]
  autores: AutorOption[]
  fetchingReinos: boolean
  fetchingFamilias: boolean
  fetchingGeneros: boolean
  fetchingAutores: boolean
  reinoSelecionado: number | string | null
  familiaSelecionada: number | string | null
  onCancel: () => void
  onSubmit: () => void | Promise<void>
  onSearchReinos: (text: string) => void
  onSearchFamilias: (text: string) => void
  onSearchGeneros: (text: string) => void
  onSearchAutores: (text: string) => void
  onReinoChange: (reinoId: number | string | undefined) => void
  onFamiliaChange: (familiaId: number | string | undefined) => void
}

const EspecieModal: React.FC<EspecieModalProps> = ({
  open,
  title,
  loading,
  control,
  reinos,
  familias,
  generos,
  autores,
  fetchingReinos,
  fetchingFamilias,
  fetchingGeneros,
  fetchingAutores,
  reinoSelecionado,
  familiaSelecionada,
  onCancel,
  onSubmit,
  onSearchReinos,
  onSearchFamilias,
  onSearchGeneros,
  onSearchAutores,
  onReinoChange,
  onFamiliaChange
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
                onChange={value => {
                  field.onChange(value)
                  onFamiliaChange(value)
                }}
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
        <span>Nome do gênero:</span>
      </Col>
    </Row>
    <Row gutter={8}>
      <Col span={24}>
        <Controller
          name="generoId"
          control={control}
          render={({ field }) => (
            <Form.Item>
              <Select
                placeholder={familiaSelecionada ? 'Selecione um gênero' : 'Selecione uma família primeiro'}
                allowClear
                showSearch
                disabled={!familiaSelecionada}
                loading={fetchingGeneros}
                notFoundContent={fetchingGeneros ? <Spin size="small" /> : 'Nenhum resultado encontrado'}
                optionFilterProp="label"
                style={{ width: '100%' }}
                value={field.value === undefined || field.value === '' ? undefined : field.value}
                onChange={field.onChange}
                onSearch={onSearchGeneros}
                options={generos.map(g => ({
                  value: g.id,
                  label: g.nome
                }))}
              />
            </Form.Item>
          )}
        />
      </Col>
    </Row>

    <Row gutter={8} style={{ marginTop: 16 }}>
      <Col span={24}>
        <span>Nome da espécie:</span>
      </Col>
    </Row>
    <Row gutter={8}>
      <Col span={24}>
        <Controller
          name="nomeEspecie"
          control={control}
          render={({ field }) => (
            <Form.Item>
              <Input {...field} placeholder="" type="text" />
            </Form.Item>
          )}
        />
      </Col>
    </Row>

    <Row gutter={8} style={{ marginTop: 16 }}>
      <Col span={24}>
        <span>Nome do autor:</span>
      </Col>
    </Row>
    <Row gutter={8}>
      <Col span={24}>
        <Controller
          name="autorId"
          control={control}
          render={({ field }) => (
            <Form.Item>
              <Select
                placeholder="Selecione um autor"
                allowClear
                showSearch
                loading={fetchingAutores}
                notFoundContent={fetchingAutores ? <Spin size="small" /> : 'Nenhum resultado encontrado'}
                optionFilterProp="label"
                style={{ width: '100%' }}
                value={field.value === undefined || field.value === '' ? undefined : field.value}
                onChange={field.onChange}
                onSearch={onSearchAutores}
                options={autores.map(a => ({
                  value: a.id,
                  label: a.nome
                }))}
              />
            </Form.Item>
          )}
        />
      </Col>
    </Row>
  </Modal>
)

export default EspecieModal
