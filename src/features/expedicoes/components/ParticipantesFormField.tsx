import {
  Col, Form, Select, Spin
} from 'antd'
import { useTranslation } from 'react-i18next'

import { useBuscaRemota } from '../hooks/useBuscaRemota'
import type { SelectOption } from '../types'

interface ParticipantesFormFieldProps {
  buscar: (termo: string) => Promise<SelectOption[]>
}

export function ParticipantesFormField({ buscar }: ParticipantesFormFieldProps) {
  const { t } = useTranslation(['novaExpedicaoPage', 'common'])
  const {
    options, loading, onSearch, fixarSelecionadas
  } = useBuscaRemota(buscar)

  return (
    <>
      <Col span={24}>
        <span>{t('novaExpedicaoPage:campos.participantes')}</span>
      </Col>
      <Col span={24}>
        <Form.Item
          name="participantes"
          rules={[
            {
              required: true,
              message: t('novaExpedicaoPage:validacao.participantesObrigatorio')
            }
          ]}
        >
          <Select<number[]>
            style={{ width: '100%' }}
            mode="multiple"
            showSearch
            allowClear
            placeholder={t('novaExpedicaoPage:placeholders.participantes')}
            options={options}
            loading={loading}
            onSearch={onSearch}
            onChange={fixarSelecionadas}
            filterOption={false}
            notFoundContent={loading
              ? <Spin size="small" />
              : t('common:nenhumResultadoEncontrado')}
          />
        </Form.Item>
      </Col>
    </>
  )
}
