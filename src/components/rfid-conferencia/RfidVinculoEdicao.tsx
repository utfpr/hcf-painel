import { useState } from 'react'

import {
  Alert, Button, Descriptions, Modal, notification
} from 'antd'
import { useTranslation } from 'react-i18next'

import { useDesvincularEtiqueta } from '@/features/rfid/useRfidVinculos'
import { DisconnectOutlined } from '@ant-design/icons'

import { RfidVinculo } from './types'

interface Props {
  vinculo: RfidVinculo
  onCancel: () => void
  onSaved: () => void
}

export default function RfidVinculoEdicao({
  vinculo, onCancel, onSaved
}: Props) {
  const { t } = useTranslation('rfid')
  const [desvincular, setDesvincular] = useState(false)
  const { trigger: desvincularEtiqueta, loading: salvando } = useDesvincularEtiqueta(vinculo.id)
  const foto = vinculo.tombos_foto || vinculo.TomboFoto

  const salvar = async () => {
    if (!desvincular || salvando) return

    try {
      await desvincularEtiqueta()
      notification.success({ message: t('unlink.success'), placement: 'topRight' })
      onSaved()
    } catch {
      notification.error({
        message: t('common.error'), description: t('unlink.failure'), placement: 'topRight'
      })
    }
  }

  return (
    <Modal
      open
      title={t('unlink.title')}
      onCancel={onCancel}
      onOk={salvar}
      okText={t('unlink.save')}
      cancelText={t('common.cancel')}
      okButtonProps={{ disabled: !desvincular, danger: true }}
      cancelButtonProps={{ disabled: salvando }}
      confirmLoading={salvando}
      closable={!salvando}
      maskClosable={!salvando}
      keyboard={!salvando}
    >
      <Descriptions bordered size="small" column={1}>
        <Descriptions.Item label={t('conference.tombo')}>{foto?.tombo_hcf || '-'}</Descriptions.Item>
        <Descriptions.Item label={t('conference.barcode')}>{foto?.codigo_barra || '-'}</Descriptions.Item>
        <Descriptions.Item label="EPC">{vinculo.epc || '-'}</Descriptions.Item>
        <Descriptions.Item label="TID">{vinculo.tid || t('common.none')}</Descriptions.Item>
      </Descriptions>
      <Alert
        type="warning"
        showIcon
        message={t(desvincular ? 'unlink.pending' : 'unlink.description')}
        description={t('unlink.effects')}
        style={{ margin: '16px 0' }}
      />
      <Button
        danger
        icon={<DisconnectOutlined aria-hidden />}
        onClick={() => setDesvincular(true)}
        disabled={desvincular || salvando}
      >
        {t('unlink.action')}
      </Button>
    </Modal>
  )
}
