import { Form, Select, Spin } from 'antd6'
import { useTranslation } from 'react-i18next'

import { useBuscaRemota } from '../hooks/useBuscaRemota'
import type { SelectOption } from '../types'

interface ParticipantesFormFieldProps {
  buscar: (termo: string) => Promise<SelectOption[]>
}

/** Participantes: busca por nome no cadastro de usuários, seleção múltipla. */
export function ParticipantesFormField({ buscar }: ParticipantesFormFieldProps) {
  const { t } = useTranslation(['novaExpedicaoPage', 'common'])
  const {
    options, loading, onSearch, fixarSelecionadas
  } = useBuscaRemota(buscar)

  return (
    <Form.Item
      name="participantes"
      label={t('novaExpedicaoPage:campos.participantes')}
      rules={[{
        required: true,
        message: t('novaExpedicaoPage:validacao.participantesObrigatorio')
      }]}
    >
      <Select<number[]>
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
  )
}
