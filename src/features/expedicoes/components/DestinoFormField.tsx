import { Form, Select, Spin } from 'antd6'
import { useTranslation } from 'react-i18next'

import { useBuscaRemota } from '../hooks/useBuscaRemota'
import type { SelectOption } from '../types'

interface DestinoFormFieldProps {
  buscar: (termo: string) => Promise<SelectOption[]>
}

/** Destino da expedição: cidade já cadastrada, seleção única. */
export function DestinoFormField({ buscar }: DestinoFormFieldProps) {
  const { t } = useTranslation(['novaExpedicaoPage', 'common'])
  const {
    options, loading, onSearch, fixarSelecionadas
  } = useBuscaRemota(buscar)

  return (
    <Form.Item
      name="destino"
      label={t('novaExpedicaoPage:campos.destino')}
      rules={[{
        required: true,
        message: t('novaExpedicaoPage:validacao.destinoObrigatorio')
      }]}
    >
      <Select<number>
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
  )
}
