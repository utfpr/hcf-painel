import { Form, Select, Spin } from 'antd6'
import { useTranslation } from 'react-i18next'

import { useBuscaRemotaComIniciais } from '../hooks/useBuscaRemotaComIniciais'
import type { SelectOption } from '../types'

interface Props {
  buscar: (termo: string) => Promise<SelectOption[]>
  iniciais: SelectOption[]
}

export function ParticipantesEdicaoFormField({ buscar, iniciais }: Props) {
  const { t } = useTranslation(['editarExpedicaoPage', 'common'])
  const {
    options, loading, onSearch, fixarSelecionadas
  } = useBuscaRemotaComIniciais(buscar, iniciais)

  return (
    <Form.Item
      name="participantes"
      label={t('editarExpedicaoPage:campos.participantes')}
      rules={[{
        required: true,
        message: t('editarExpedicaoPage:validacao.participantesObrigatorio')
      }]}
    >
      <Select<number[]>
        mode="multiple"
        showSearch
        allowClear
        placeholder={t('editarExpedicaoPage:placeholders.participantes')}
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
  )
}
