import React from 'react'

import { Divider, Tabs } from 'antd'
import { useTranslation } from 'react-i18next'

import RfidImpressoraConfiguracao from './RfidImpressoraConfiguracao'
import RfidLeitorConfiguracao from './RfidLeitorConfiguracao'

const RfidConfiguracao: React.FC = () => {
  const { t } = useTranslation('rfid')

  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontWeight: 200 }}>{t('config.devicesTitle')}</h2>
      <Divider dashed />
      <Tabs defaultActiveKey="reader" destroyInactiveTabPane>
        <Tabs.TabPane tab={t('config.readerTab')} key="reader">
          <RfidLeitorConfiguracao />
        </Tabs.TabPane>
        <Tabs.TabPane tab={t('config.printerTab')} key="printer">
          <RfidImpressoraConfiguracao />
        </Tabs.TabPane>
      </Tabs>
    </div>
  )
}

export default RfidConfiguracao
