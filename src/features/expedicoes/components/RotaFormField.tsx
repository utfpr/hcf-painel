import { useState } from 'react'

import {
  Button, Col, Form, List, Select, Spin
} from 'antd'
import { useTranslation } from 'react-i18next'

import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined
} from '@ant-design/icons'

import { useBuscaRemota } from '../hooks/useBuscaRemota'
import type { SelectOption } from '../types'

const ROTA_VAZIA: number[] = []

interface RotaSelectorProps {
  value?: number[]
  onChange?: (value: number[]) => void
  buscar: (termo: string) => Promise<SelectOption[]>
}


function RotaSelector({
  value = ROTA_VAZIA, onChange, buscar
}: RotaSelectorProps) {
  const { t } = useTranslation(['novaExpedicaoPage', 'common'])
  const {
    options, loading, onSearch
  } = useBuscaRemota(buscar)
  const [labels, setLabels] = useState<Record<number, string>>({})

  const adicionar = (id: number) => {
    const opcao = options.find(item => item.value === id)
    if (opcao) setLabels(anteriores => ({ ...anteriores, [id]: opcao.label }))
    onChange?.([...value, id])
  }

  const mover = (index: number, deslocamento: -1 | 1) => {
    const destino = index + deslocamento
    if (destino < 0 || destino >= value.length) return

    const proxima = [...value]
    ;[proxima[index], proxima[destino]] = [proxima[destino], proxima[index]]
    onChange?.(proxima)
  }

  const remover = (index: number) => {
    onChange?.(value.filter((_, posicao) => posicao !== index))
  }

  return (
    <>
      <Select<number | null>
        style={{ width: '100%' }}
        showSearch
        value={null}
        placeholder={t('novaExpedicaoPage:placeholders.rota')}
        options={options}
        loading={loading}
        onSearch={onSearch}
        onSelect={id => { if (id !== null) adicionar(id) }}
        filterOption={false}
        notFoundContent={loading
          ? <Spin size="small" />
          : t('common:nenhumResultadoEncontrado')}
      />

      {value.length > 0 && (
        <List
          size="small"
          bordered
          style={{ marginTop: 8 }}
          dataSource={value.map((id, index) => ({ id, index }))}
          renderItem={({ id, index }) => (
            <List.Item
              key={`${id}-${index}`}
              actions={[
                <Button
                  key="subir"
                  size="small"
                  icon={<ArrowUpOutlined />}
                  disabled={index === 0}
                  aria-label={t('novaExpedicaoPage:rota.subir')}
                  onClick={() => mover(index, -1)}
                />,
                <Button
                  key="descer"
                  size="small"
                  icon={<ArrowDownOutlined />}
                  disabled={index === value.length - 1}
                  aria-label={t('novaExpedicaoPage:rota.descer')}
                  onClick={() => mover(index, 1)}
                />,
                <Button
                  key="remover"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  aria-label={t('novaExpedicaoPage:rota.remover')}
                  onClick={() => remover(index)}
                />
              ]}
            >
              <span>{`${index + 1}. ${labels[id] ?? `#${id}`}`}</span>
            </List.Item>
          )}
        />
      )}
    </>
  )
}

interface RotaFormFieldProps {
  buscar: (termo: string) => Promise<SelectOption[]>
}

export function RotaFormField({ buscar }: RotaFormFieldProps) {
  const { t } = useTranslation('novaExpedicaoPage')

  return (
    <>
      <Col span={24}>
        <span>{t('campos.rota')}</span>
      </Col>
      <Col span={24}>
        <Form.Item name="rotas">
          <RotaSelector buscar={buscar} />
        </Form.Item>
      </Col>
    </>
  )
}
