import React, {
  useCallback, useEffect, useState
} from 'react'

import {
  Alert, Button, Col, Form, Input, Row, Select, Space, Typography, notification
} from 'antd'
import axios from 'axios'
import { useTranslation } from 'react-i18next'

import {
  ApiOutlined, CheckCircleOutlined, DisconnectOutlined, ReloadOutlined
} from '@ant-design/icons'

import { getDefaultReaderIdentifier, rfidReaderTypes } from '../config/rfidReaders'
import { useRfidStore } from '../stores/useRfidStore'

const { Option } = Select
const { Text } = Typography

const RfidConnectionPanel: React.FC = () => {
  const {
    apiUrl,
    tipoDispositivo,
    identificador,
    portaSerial,
    hardwareOnline,
    validandoHardware,
    statusConexao,
    setConfig,
    verificarHardware,
    conectar,
    desconectar
  } = useRfidStore()
  const { t } = useTranslation('rfid')
  const [portasSeriais, setPortasSeriais] = useState<string[]>([])
  const [carregandoPortas, setCarregandoPortas] = useState(false)

  const notificacao = (type: 'success' | 'warning' | 'error' | 'info', titulo: string, descricao: string) => {
    notification[type]({
      message: titulo, description: descricao, placement: 'topRight'
    })
  }

  const buscarPortasSeriais = useCallback(async () => {
    setCarregandoPortas(true)

    try {
      const response = await axios.get<{ dispositivos: Array<{ porta?: string }> }>(`${apiUrl}/debug/scan`, {
        headers: { type: 'COM' }, timeout: 5000
      })

      const portas = response.data.dispositivos.map(item => item.porta).filter((porta): porta is string => Boolean(porta))
      setPortasSeriais(portas)

      if (portas.length === 0) {
        notificacao('info', t('notifications.noPortTitle'), t('notifications.noPortDescription'))
      }

    } catch {
      setPortasSeriais([])
      notificacao('warning', t('notifications.scanFailedTitle'), t('notifications.scanFailedDescription'))
    } finally {
      setCarregandoPortas(false)
    }

  }, [apiUrl, t])

  useEffect(() => {
    if (tipoDispositivo === 'HEXAPAD') void buscarPortasSeriais()
  }, [tipoDispositivo, buscarPortasSeriais])

  const handleConectar = async () => {
    if (!apiUrl.trim()) {
      notificacao('warning', t('notifications.urlRequiredTitle'), t('notifications.urlRequiredDescription'))
      return
    }

    if (tipoDispositivo === 'HEXAPAD' && !portaSerial) {
      notificacao('warning', t('notifications.serialPortTitle'), t('notifications.serialPortRequired'))
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
    setConfig({
      tipoDispositivo: value, identificador: getDefaultReaderIdentifier(value), portaSerial: ''
    })
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
            <Text>
              {t('connection.usingDevice')}
              {' '}
              <strong>{tipoDispositivo}</strong>
            </Text>
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
                    {rfidReaderTypes.map(reader => (
                      <Option key={reader.type} value={reader.type}>{t(reader.labelKey)}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} lg={6}>
                <Form.Item label={t('common.identifier')} style={{ marginBottom: 0 }}>
                  <Input
                    value={identificador}
                    disabled
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
                      style={{
                        backgroundColor: '#faad14', borderColor: '#faad14', color: '#fff'
                      }}
                    >
                      {t('common.connect')}
                    </Button>
                  </Space>
                </Form.Item>
              </Col>
            </Row>
            {tipoDispositivo === 'HEXAPAD' && (
              <Row gutter={[16, 16]} style={{ marginTop: 12 }}>
                <Col xs={24} sm={12} lg={8}>
                  <Form.Item label={t('config.serialPortLabel')} style={{ marginBottom: 0 }}>
                    <Space style={{ width: '100%' }}>
                      <Select
                        value={portaSerial || undefined}
                        onChange={value => setConfig({ portaSerial: value })}
                        placeholder={t('config.serialPortPlaceholder')}
                        loading={carregandoPortas}
                        style={{ width: 220 }}
                      >
                        {portasSeriais.map(porta => <Option key={porta} value={porta}>{porta}</Option>)}
                      </Select>
                      <Button icon={<ReloadOutlined />} onClick={buscarPortasSeriais} loading={carregandoPortas} title={t('config.scanPortsAgain')} />
                    </Space>
                  </Form.Item>
                </Col>
              </Row>
            )}
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
