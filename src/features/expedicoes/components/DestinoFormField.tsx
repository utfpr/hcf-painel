import {
  Col, Form, Select, Spin
} from 'antd'
import { useTranslation } from 'react-i18next'

import { useBuscaRemota } from '../hooks/useBuscaRemota'
import type { SelectOption } from '../types'

interface DestinoFormFieldProps {
  buscar: (termo: string) => Promise<SelectOption[]>
}

export function DestinoFormField({ buscar }: DestinoFormFieldProps) {
  const { t } = useTranslation(['novaExpedicaoPage', 'common'])
  const {
    options, loading, onSearch, fixarSelecionadas
  } = useBuscaRemota(buscar)

  return (
    <>
      <Col span={24}>
        <span>{t('novaExpedicaoPage:campos.destino')}</span>
      </Col>
      <Col span={24}>
        <Form.Item
          name="destino"
          rules={[
            {
              required: true,
              message: t('novaExpedicaoPage:validacao.destinoObrigatorio')
            }
          ]}
        >
          <Select<number>
            style={{ width: '100%' }}
            showSearch
            allowClear
            placeholder={t('novaExpedicaoPage:placeholders.destino')}
            options={options}
            loading={loading}
            onSearch={onSearch}
            onChange={valor => fixarSelecionadas(valor ? [valor] : [])}
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
