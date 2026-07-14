import React, { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Row, Col, Divider, Card, Select, Button, Input, notification, Tag, Spin, Modal, Alert } from 'antd'
import { ApiOutlined, CheckCircleOutlined, DisconnectOutlined, ReloadOutlined, EditOutlined, WarningOutlined, StopOutlined } from '@ant-design/icons'
import axios from 'axios'
import { useRfidStore } from '../stores/useRfidStore'

const { Option } = Select

const getDefaultIdentifier = (tipoDispositivo: string) => {
  switch (tipoDispositivo) {
    case 'MOCK': return 'mock'
    case 'HEXAPAD': return 'hexapad'
    case 'CHAINWAY_NATIVE': return 'chainway'
    default: return 'mock'
  }
}

const RfidConfiguracao: React.FC = () => {
  const { t } = useTranslation('rfid')
  const {
    apiUrl,
    tipoDispositivo,
    identificador,
    portaSerial,
    hardwareOnline,
    statusConexao,
    setConfig,
    conectar,
    desconectar,
    verificarHardware
  } = useRfidStore()

  const [modalUrlVisible, setModalUrlVisible] = useState<boolean>(false)
  const [novaUrlInput, setNovaUrlInput] = useState<string>('')
  const [infoSO, setInfoSO] = useState<string | null>(null)
  const [uptime, setUptime] = useState<string | null>(null)
  const [carregandoDiagnostico, setCarregandoDiagnostico] = useState<boolean>(true)
  const [portasSeriais, setPortasSeriais] = useState<string[]>([])
  const [carregandoPortas, setCarregandoPortas] = useState<boolean>(false)

  const notificacao = (type: 'success' | 'warning' | 'error' | 'info', titulo: string, descricao: string) => {
    notification[type]({ message: titulo, description: descricao, placement: 'topRight' })
  }

  const buscarPortasSeriais = useCallback(async () => {
    setCarregandoPortas(true)
    try {
      const response = await axios.get(`${apiUrl}/debug/scan`, { timeout: 5000 })
      const data = response.data.dispositivos || []
      const ports = data.map((disp: any) => disp.porta)
      setPortasSeriais(ports)

      if (ports.length === 0) {
        notificacao('info', t('notifications.noPortTitle'), t('notifications.noPortDescription'))
      }
    } catch (error) {
      notificacao('warning', t('notifications.scanFailedTitle'), t('notifications.scanFailedDescription'))
      setPortasSeriais([])
    } finally {
      setCarregandoPortas(false)
    }
  }, [apiUrl, t])

  const buscarDiagnostico = useCallback(async () => {
    setCarregandoDiagnostico(true)
    await verificarHardware()

    try {
      const response = await axios.get(`${apiUrl}/status`, { timeout: 3000 })
      if (response.status === 200) {
        setInfoSO(response.data.so || t('config.localSystem'))
        setUptime(response.data.tempo_atividade || t('config.uptimeUnavailable'))
      }
    } catch (error) {
      setInfoSO(null)
      setUptime(null)
    } finally {
      setCarregandoDiagnostico(false)
    }
  }, [apiUrl, t, verificarHardware])

  useEffect(() => {
    buscarDiagnostico()
  }, [buscarDiagnostico])

  useEffect(() => {
    if (tipoDispositivo === 'HEXAPAD' && infoSO) {
      buscarPortasSeriais()
    }
  }, [tipoDispositivo, infoSO, buscarPortasSeriais])

  const handleTipoDispositivoChange = (value: string) => {
    setConfig({ tipoDispositivo: value, identificador: getDefaultIdentifier(value), portaSerial: '' })
    if (statusConexao === 'CONECTADO') desconectar()
  }

  const handleConectar = async () => {
    if (statusConexao === 'CONECTADO') {
      notificacao('info', t('common.warning'), t('notifications.alreadyConnected'))
      return
    }

    if (tipoDispositivo === 'HEXAPAD' && !portaSerial) {
      notificacao('warning', t('notifications.serialPortTitle'), t('notifications.serialPortRequired'))
      return
    }

    const sucesso = await conectar()
    if (sucesso) {
      notificacao('success', t('common.connected'), t('notifications.deviceConnected', { device: tipoDispositivo }))
      buscarDiagnostico()
    } else {
      notificacao('error', t('notifications.connectionErrorTitle'), t('notifications.hardwareInitFailed'))
    }
  }

  const abrirModalEdicaoUrl = () => {
    setNovaUrlInput(apiUrl)
    setModalUrlVisible(true)
  }

  const salvarNovaUrl = () => {
    if (!novaUrlInput.trim()) {
      notificacao('warning', t('common.attention'), t('notifications.emptyAddress'))
      return
    }

    const cleanUrl = novaUrlInput.trim()
    setConfig({ apiUrl: cleanUrl })
    if (statusConexao === 'CONECTADO') desconectar()
    setModalUrlVisible(false)
    notificacao('info', t('notifications.addressUpdatedTitle'), t('notifications.addressUpdatedDescription'))
    setTimeout(buscarDiagnostico, 100)
  }

  const renderStatusTag = () => {
    switch (statusConexao) {
      case 'CONECTADO':
        return <Tag color="success" icon={<CheckCircleOutlined />}>{t('config.hardwareReady')}</Tag>
      case 'CONECTANDO':
        return <Tag color="processing" icon={<Spin size="small" />}> {t('common.initializing')}</Tag>
      default:
        return <Tag color="default" icon={<DisconnectOutlined />}>{t('common.disconnected')}</Tag>
    }
  }

  return (
    <div style={{ padding: '24px' }}>
      <Row>
        <Col span={24}>
          <h2 style={{ fontWeight: 200 }}>{t('config.title')}</h2>
        </Col>
      </Row>
      <Divider dashed />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title={t('config.cardTitle')} bordered={false} style={{ height: '100%' }}>
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col span={24}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ color: '#8c8c8c' }}>{t('config.serviceAddress')}</span>
                    <Input
                      value={apiUrl}
                      disabled
                      style={{ marginTop: 8, backgroundColor: '#f5f5f5', color: '#595959' }}
                    />
                  </div>
                  <Button
                    type="dashed"
                    danger
                    icon={<EditOutlined />}
                    onClick={abrirModalEdicaoUrl}
                  >
                    {t('common.edit')}
                  </Button>
                </div>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <span>{t('config.deviceLabel')}</span>
                <Select
                  value={tipoDispositivo}
                  onChange={handleTipoDispositivoChange}
                  style={{ width: '100%', marginTop: 8 }}
                  disabled={!hardwareOnline && statusConexao === 'DESCONECTADO'}
                >
                  <Option value="CHAINWAY_NATIVE">Chainway R3</Option>
                  <Option value="HEXAPAD">Acura Hexapad</Option>
                  <Option value="MOCK">{t('connection.mockEmulator')}</Option>
                </Select>
              </Col>
              <Col xs={24} sm={12}>
                <span>{t('config.identifierLabel')}</span>
                <Input
                  value={identificador}
                  disabled
                  style={{ marginTop: 8, backgroundColor: '#f5f5f5', color: '#595959' }}
                />
              </Col>
            </Row>

            {tipoDispositivo === 'HEXAPAD' && (
              <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24} sm={12}>
                  <span>{t('config.serialPortLabel')}</span>
                  <div style={{ display: 'flex', gap: '8px', marginTop: 8 }}>
                    <Select
                      value={portaSerial || undefined}
                      onChange={(value) => {
                        setConfig({ portaSerial: value })
                        if (statusConexao === 'CONECTADO') desconectar()
                      }}
                      style={{ flex: 1 }}
                      placeholder={t('config.serialPortPlaceholder')}
                      loading={carregandoPortas}
                      disabled={!hardwareOnline && statusConexao === 'DESCONECTADO'}
                    >
                      {portasSeriais.map(porta => (
                        <Option key={porta} value={porta}>{porta}</Option>
                      ))}
                    </Select>
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={buscarPortasSeriais}
                      loading={carregandoPortas}
                      disabled={!hardwareOnline && statusConexao === 'DESCONECTADO'}
                      title={t('config.scanPortsAgain')}
                    />
                  </div>
                </Col>
              </Row>
            )}

            <Divider dashed style={{ margin: '24px 0' }} />

            <Row>
              <Col span={24}>
                <Button
                  type="primary"
                  icon={<ApiOutlined />}
                  onClick={handleConectar}
                  loading={statusConexao === 'CONECTANDO'}
                  disabled={statusConexao === 'CONECTADO' || (!hardwareOnline && statusConexao === 'DESCONECTADO')}
                  style={{ width: '100%', maxWidth: '300px' }}
                >
                  {statusConexao === 'CONECTADO' ? t('config.hardwareInitialized') : t('config.initializeAndConnect')}
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title={(
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{t('config.diagnostics')}</span>
                <Button
                  type="link"
                  icon={<ReloadOutlined />}
                  onClick={buscarDiagnostico}
                  size="small"
                  loading={carregandoDiagnostico}
                />
              </div>
            )}
            bordered={false}
            style={{ height: '100%', backgroundColor: '#fafafa' }}
          >
            {carregandoDiagnostico ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Spin size="large" />
                <div style={{ marginTop: 16, color: '#8c8c8c' }}>{t('config.testingCommunication')}</div>
              </div>
            ) : !hardwareOnline && statusConexao === 'DESCONECTADO' ? (
              <Alert
                message={<span style={{ fontWeight: 'bold' }}>{t('config.serviceInaccessible')}</span>}
                description={(
                  <div style={{ marginTop: 8 }}>
                    <p>{t('config.serviceCommunicationError')}</p>
                    <b>{t('config.check')}</b>
                    <ul style={{ paddingLeft: 16, marginTop: 4, marginBottom: 0 }}>
                      <li>{t('config.checkExecutableOpen')}</li>
                      <li>{t('config.checkServiceAddress')}</li>
                    </ul>
                  </div>
                )}
                type="error"
                showIcon
                icon={<StopOutlined />}
              />
            ) : (
              <>
                <Row style={{ marginBottom: 16 }}>
                  <Col span={24}>
                    <span style={{ color: '#8c8c8c' }}>{t('config.readerStatus')}</span>
                    <div style={{ marginTop: 8 }}>
                      {renderStatusTag()}
                    </div>
                  </Col>
                </Row>

                <Divider dashed style={{ margin: '16px 0' }} />

                <Row style={{ marginBottom: 16 }}>
                  <Col span={24}>
                    <span style={{ color: '#8c8c8c' }}>{t('config.operatingSystem')}</span>
                    <div style={{ marginTop: 4, fontWeight: 500 }}>
                      {infoSO}
                    </div>
                  </Col>
                </Row>

                <Row>
                  <Col span={24}>
                    <span style={{ color: '#8c8c8c' }}>{t('config.uptime')}</span>
                    <div style={{ marginTop: 4, fontWeight: 500 }}>
                      {uptime}
                    </div>
                  </Col>
                </Row>
              </>
            )}
          </Card>
        </Col>
      </Row>

      <Modal
        title={<span style={{ color: '#cf1322' }}><WarningOutlined /> {t('config.advancedConfig')}</span>}
        visible={modalUrlVisible}
        onOk={salvarNovaUrl}
        onCancel={() => setModalUrlVisible(false)}
        okText={t('common.saveUrl')}
        cancelText={t('common.cancel')}
        okButtonProps={{ danger: true }}
        destroyOnClose
      >
        <Alert
          message={t('config.communicationWarning')}
          description={t('config.urlWarningDescription')}
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <p style={{ fontWeight: 500 }}>{t('config.localServiceAddress')}</p>
        <Input
          value={novaUrlInput}
          onChange={e => setNovaUrlInput(e.target.value)}
          placeholder="http://localhost:43785"
        />
      </Modal>
    </div>
  )
}

export default RfidConfiguracao
