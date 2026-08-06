import React from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Button, Col, Form, Input, Row, Select, Space, Typography, notification } from 'antd'
import { ApiOutlined, CheckCircleOutlined, DisconnectOutlined, ReloadOutlined } from '@ant-design/icons'
import { useRfidStore } from '../stores/useRfidStore'

const { Option } = Select
const { Text } = Typography

const getDefaultIdentifier = (tipoDispositivo: string) => (
  tipoDispositivo === 'MOCK' ? 'mock_device' : 'chainway_native'
)

const RfidConnectionPanel: React.FC = () => {
  const {
    apiUrl,
    tipoDispositivo,
    identificador,
    hardwareOnline,
    validandoHardware,
    statusConexao,
    setConfig,
    verificarHardware,
    conectar,
    desconectar
  } = useRfidStore()
  const { t } = useTranslation('rfid')

  const notificacao = (type: 'success' | 'warning' | 'error' | 'info', titulo: string, descricao: string) => {
    notification[type]({ message: titulo, description: descricao, placement: 'topRight' })
  }

  const handleConectar = async () => {
    if (!apiUrl.trim()) {
      notificacao('warning', t('notifications.urlRequiredTitle'), t('notifications.urlRequiredDescription'))
      return
    }

    const sucesso = await conectar()
    if (sucesso) {
      notificacao('success', t('notifications.readerReadyTitle'), t('notifications.readerReadyDescription'))
    } else {
      notificacao('error', t('notifications.connectionFailureTitle'), t('notifications.connectionFailureDescription'))
    }
  }

  const handleChangeApiUrl = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig({ apiUrl: e.target.value })
    if (statusConexao === 'CONECTADO') desconectar()
  }

  const handleChangeDispositivo = (value: string) => {
    setConfig({ tipoDispositivo: value, identificador: getDefaultIdentifier(value) })
    if (statusConexao === 'CONECTADO') desconectar()
  }

  const handleChangeIdentificador = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig({ identificador: e.target.value })
    if (statusConexao === 'CONECTADO') desconectar()
  }

  if (hardwareOnline && statusConexao === 'CONECTADO') {
    return (
      <Alert
        type="success"
        showIcon
        icon={<CheckCircleOutlined />}
        message={<Text strong>{t('connection.readerReady')}</Text>}
        description={(
          <Space size="middle" style={{ marginTop: 4 }}>
            <Text>{t('connection.usingDevice')} <strong>{tipoDispositivo}</strong></Text>
            <Button size="small" type="link" onClick={desconectar} danger>
              {t('common.disconnectChange')}
            </Button>
          </Space>
        )}
        style={{ marginBottom: 24, padding: '12px 20px' }}
      />
    )
  }

  return (
    <Alert
      type="warning"
      showIcon
      icon={<DisconnectOutlined />}
      message={<Text strong>{t('connection.readerNotConnected')}</Text>}
      description={(
        <div style={{ marginTop: 16 }}>
          <Form layout="vertical">
            <Row gutter={[16, 16]} align="bottom">
              <Col xs={24} lg={8}>
                <Form.Item label={t('connection.serviceAddressLocal')} style={{ marginBottom: 0 }}>
                  <Input
                    value={apiUrl}
                    onChange={handleChangeApiUrl}
                    placeholder="http://localhost:43785"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} lg={6}>
                <Form.Item label={t('common.device')} style={{ marginBottom: 0 }}>
                  <Select
                    value={tipoDispositivo}
                    onChange={handleChangeDispositivo}
                    style={{ width: '100%' }}
                  >
                    <Option value="CHAINWAY_NATIVE">{t('connection.chainwayNative')}</Option>
                    <Option value="MOCK">{t('connection.mockEmulator')}</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} lg={6}>
                <Form.Item label={t('common.identifier')} style={{ marginBottom: 0 }}>
                  <Input
                    value={identificador}
                    onChange={handleChangeIdentificador}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} lg={4}>
                <Form.Item style={{ marginBottom: 0 }}>
                  <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={verificarHardware}
                      loading={validandoHardware}
                      title={t('common.checkCurrentStatus')}
                    />
                    <Button
                      type="primary"
                      icon={<ApiOutlined />}
                      onClick={handleConectar}
                      loading={statusConexao === 'CONECTANDO'}
                      style={{ backgroundColor: '#faad14', borderColor: '#faad14', color: '#fff' }}
                    >
                      {t('common.connect')}
                    </Button>
                  </Space>
                </Form.Item>
              </Col>
            </Row>
          </Form>

          <div style={{ marginTop: 12 }}>
            <Text type="secondary" style={{ fontSize: '13px' }}>
              {t('connection.connectHelp')}
            </Text>
          </div>
        </div>
      )}
      style={{ marginBottom: 24, padding: '16px 24px' }}
    />
  )
}

export default RfidConnectionPanel
