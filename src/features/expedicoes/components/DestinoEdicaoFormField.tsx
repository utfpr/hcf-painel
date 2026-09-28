import { Form, Select, Spin } from 'antd6'
import { useTranslation } from 'react-i18next'

import { useBuscaRemotaComIniciais } from '../hooks/useBuscaRemotaComIniciais'
import type { SelectOption } from '../types'

interface Props {
  buscar: (termo: string) => Promise<SelectOption[]>
  iniciais: SelectOption[]
}

export function DestinoEdicaoFormField({ buscar, iniciais }: Props) {
  const { t } = useTranslation(['editarExpedicaoPage', 'common'])
  const {
    options, loading, onSearch, fixarSelecionadas
  } = useBuscaRemotaComIniciais(buscar, iniciais)

  return (
    <Form.Item
      name="destino"
      label={t('editarExpedicaoPage:campos.destino')}
      rules={[{
        required: true,
        message: t('editarExpedicaoPage:validacao.destinoObrigatorio')
      }]}
    >
      <Select<number>
        showSearch
        allowClear
        placeholder={t('editarExpedicaoPage:placeholders.destino')}
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
