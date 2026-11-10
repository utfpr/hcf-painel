import React, {
  useCallback, useEffect, useRef, useState
} from 'react'

import {
  Alert, Button, Card, Col, Form, Input, InputNumber, Modal, Row, Select, Space, Spin, Tag, notification
} from 'antd'
import axios from 'axios'
import { useTranslation } from 'react-i18next'

import {
  EditOutlined, PrinterOutlined, ReloadOutlined, SearchOutlined, WarningOutlined
} from '@ant-design/icons'

import { PrinterMode, usePrinterStore } from '../stores/usePrinterStore'

interface PrinterSummary {
  id: string
  type: string
  connectionType: string
  host: string | null
  port: number | null
  name: string | null
  dpi: number
  labelWidthDots: number
  labelHeightDots: number
}

interface PrinterStatus {
  connected: boolean
  ready: boolean | null
  message: string
}

interface DiscoveredPrinter {
  address: string | null
  port: number | null
  name: string | null
  model: string | null
}

const errorText = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const response: unknown = error.response?.data

    if (response && typeof response === 'object') {
      const details = response as { error?: unknown; detail?: unknown }

      if (typeof details.error === 'string') {
        return details.error
      }

      if (typeof details.detail === 'string') {
        return details.detail
      }
    }

    return error.message
  }

  return error instanceof Error ? error.message : String(error)
}

const getDefaultIdentifier = (mode: PrinterMode): string => {
  switch (mode) {
    case 'TCP': return 'zebra_tcp'
    case 'USB': return 'zebra_usb'
    case 'MOCK': return 'mock'
    default: return 'mock'
  }
}

const RfidImpressoraConfiguracao: React.FC = () => {
  const { t } = useTranslation('rfid')
  const {
    apiUrl, mode, host, port, dpi, labelWidthDots, labelHeightDots, setConfig
  } = usePrinterStore()
  const [modalUrlVisible, setModalUrlVisible] = useState(false)
  const [novaUrlInput, setNovaUrlInput] = useState('')
  const [online, setOnline] = useState(false)
  const [configured, setConfigured] = useState(false)
  const [status, setStatus] = useState<PrinterStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [printing, setPrinting] = useState(false)
  const [discovering, setDiscovering] = useState(false)
  const [discovered, setDiscovered] = useState<DiscoveredPrinter[]>([])
  const [error, setError] = useState('')
  const requestId = useRef(0)
  const discoveryId = useRef(0)

  const baseUrl = apiUrl.trim().replace(/\/+$/, '')
  const printerId = getDefaultIdentifier(mode)

  const matchesConfig = (printer: PrinterSummary) =>
    printer.type === (mode === 'MOCK' ? 'MOCK' : 'ZEBRA')
    && printer.connectionType === mode
    && (mode !== 'TCP' || (printer.host === host.trim() && printer.port === port))
    && (mode !== 'USB' || printer.name === null)
    && printer.dpi === dpi && printer.labelWidthDots === labelWidthDots && printer.labelHeightDots === labelHeightDots

  const refresh = useCallback(async () => {
    const currentRequest = ++requestId.current
    if (!baseUrl || !printerId) {
      setOnline(false)
      setConfigured(false)
      setStatus(null)
      return
    }

    setLoading(true)
    setError('')

    try {
      await axios.get(`${baseUrl}/status`, { timeout: 5000 })
      if (currentRequest !== requestId.current) {
        return
      }

      setOnline(true)

      const response = await axios.get<{ printers: PrinterSummary[] }>(`${baseUrl}/printers`, { timeout: 5000 })
      if (currentRequest !== requestId.current) {
        return
      }

      const printer = response.data.printers.find(item => item.id.toLowerCase() === printerId.toLowerCase())
      if (!printer || !matchesConfig(printer)) {
        setConfigured(false)
        setStatus(null)
        return
      }

      setConfigured(true)

      try {
        const statusResponse = await axios.get<PrinterStatus>(`${baseUrl}/printers/${encodeURIComponent(printerId)}/status`, { timeout: 10000 })
        if (currentRequest !== requestId.current) {
          return
        }

        setStatus(statusResponse.data)
      } catch (statusError) {
        if (currentRequest !== requestId.current) {
          return
        }

        setStatus(null)
        setError(errorText(statusError))
      }
    } catch (serviceError) {
      if (currentRequest !== requestId.current) {
        return
      }

      setOnline(false)
      setConfigured(false)
      setStatus(null)
      setError(errorText(serviceError))
    } finally {
      if (currentRequest === requestId.current) {
        setLoading(false)
      }
    }
  }, [
    baseUrl,
    printerId,
    mode,
    host,
    port,
    dpi,
    labelWidthDots,
    labelHeightDots
  ])

  useEffect(() => {
    requestId.current += 1
    setConfigured(false)
    setStatus(null)

    const timer = window.setTimeout(() => {
      void refresh()
    }, 350)

    return () => {
      window.clearTimeout(timer)
      requestId.current += 1
    }
  }, [refresh])

  const discover = useCallback(async () => {
    const currentDiscovery = ++discoveryId.current
    setDiscovering(true)
    setDiscovered([])

    try {
      const response = await axios.get<{ printers: DiscoveredPrinter[] }>(`${baseUrl}/printers/discovery/network`, { timeout: 20000 })
      if (currentDiscovery !== discoveryId.current) {
        return
      }

      setDiscovered(response.data.printers)
      if (response.data.printers.length === 0) {
        notification.info({ message: t('printer.noPrintersFound') })
      }

    } catch (discoveryError) {
      if (currentDiscovery !== discoveryId.current) {
        return
      }

      notification.error({ message: t('printer.discoveryFailed'), description: errorText(discoveryError) })
    } finally {
      if (currentDiscovery === discoveryId.current) {
        setDiscovering(false)
      }
    }
  }, [
    baseUrl,
    t
  ])

  useEffect(() => {
    if (online && mode === 'TCP') void discover()
  }, [
    discover,
    mode,
    online
  ])

  const openUrlModal = () => {
    setNovaUrlInput(apiUrl)
    setModalUrlVisible(true)
  }

  const saveUrl = () => {
    const candidate = novaUrlInput.trim().replace(/\/+$/, '')
    if (!candidate.startsWith('http://') && !candidate.startsWith('https://')) {
      notification.warning({ message: t('printer.invalidUrl') })
      return
    }

    if (candidate !== baseUrl) {
      discoveryId.current += 1
      setDiscovering(false)
      setDiscovered([])
      setOnline(false)
      setConfigured(false)
      setStatus(null)
      setConfig({ apiUrl: candidate })
    } else {
      void refresh()
    }

    setModalUrlVisible(false)
  }

  const configure = async () => {
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
      notification.warning({ message: t('printer.invalidUrl') })
      return
    }

    if (!printerId || (mode === 'TCP' && !host.trim())) {
      notification.warning({ message: t('printer.requiredFields') })
      return
    }

    const connection = mode === 'TCP'
      ? {
        connectionType: 'TCP', host: host.trim(), port
      }
      : mode === 'USB'
        ? { connectionType: 'USB' }
        : { connectionType: 'MOCK' }

    setSaving(true)

    try {
      await axios.put(`${baseUrl}/printers/configuracao`, {
        id: printerId,
        type: mode === 'MOCK' ? 'MOCK' : 'ZEBRA',
        connection,
        defaults: {
          language: 'ZPL', dpi, labelWidthDots, labelHeightDots
        }
      }, { timeout: 10000 })

      notification.success({ message: t('printer.configuredSuccess') })
      await refresh()

    } catch (configureError) {
      notification.error({ message: t('printer.configurationFailed'), description: errorText(configureError) })
    } finally {
      setSaving(false)
    }
  }

  const testPrint = async () => {
    setPrinting(true)

    try {
      const response = await axios.post<{ success: boolean }>(`${baseUrl}/printers/${encodeURIComponent(printerId)}/test-print`, {}, { timeout: 20000 })
      if (!response.data.success) {
        throw new Error(t('printer.testFailed'))
      }

      notification.success({ message: t('printer.testSent') })
      await refresh()

    } catch (printError) {
      notification.error({ message: t('printer.testFailed'), description: errorText(printError) })
    } finally {
      setPrinting(false)
    }
  }

  const changeMode = (value: PrinterMode) => {
    setConfig({ mode: value })
    discoveryId.current += 1
    setDiscovering(false)
    setDiscovered([])
    setConfigured(false)
    setStatus(null)
  }

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={16}>
        <Card title={t('printer.configuration')} bordered={false}>
          <Form layout="vertical">
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item label={t('printer.serviceUrl')} required>
                  <Space.Compact style={{ width: '100%' }}>
                    <Input value={apiUrl} disabled />
                    <Button type="dashed" danger icon={<EditOutlined />} onClick={openUrlModal}>
                      {t('common.edit')}
                    </Button>
                  </Space.Compact>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label={t('printer.connectionMode')} required>
                  <Select value={mode} onChange={changeMode}>
                    <Select.Option value="TCP">Zebra TCP</Select.Option>
                    <Select.Option value="USB">Zebra USB</Select.Option>
                    <Select.Option value="MOCK">MOCK</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              {mode === 'TCP' && (
                <>
                  <Col xs={24} sm={12}>
                    <Form.Item label={t('printer.host')} required>
                      <Input value={host} onChange={event => setConfig({ host: event.target.value })} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item label={t('printer.port')} required>
                      <InputNumber min={1} max={65535} value={port} onChange={value => setConfig({ port: value || 9100 })} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </>
              )}
            </Row>
            {mode === 'TCP' && (
              <Button icon={<SearchOutlined />} onClick={discover} loading={discovering} disabled={!online} style={{ marginBottom: 20 }}>
                {t('printer.discover')}
              </Button>
            )}
            {mode === 'TCP' && discovered.length > 0 && (
              <Form.Item label={t('printer.discovered')}>
                <Select
                  placeholder={t('printer.selectNetwork')}
                  onChange={value => {
                    const printer = discovered.find(item => item.address === value)
                    if (printer) setConfig({ host: printer.address || '', port: printer.port || 9100 })
                  }}
                >
                  {discovered.filter(item => item.address).map(item => (
                    <Select.Option key={item.address} value={item.address!}>
                      {item.model || item.name || item.address}
                      {' '}
                      (
                      {item.address}
                      )
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            )}
            <Row gutter={16}>
              <Col xs={24} sm={8}><Form.Item label="DPI"><InputNumber min={1} value={dpi} onChange={value => setConfig({ dpi: value || 203 })} style={{ width: '100%' }} /></Form.Item></Col>
              <Col xs={24} sm={8}><Form.Item label={t('printer.labelWidth')}><InputNumber min={1} value={labelWidthDots} onChange={value => setConfig({ labelWidthDots: value || 799 })} style={{ width: '100%' }} /></Form.Item></Col>
              <Col xs={24} sm={8}><Form.Item label={t('printer.labelHeight')}><InputNumber min={1} value={labelHeightDots} onChange={value => setConfig({ labelHeightDots: value || 304 })} style={{ width: '100%' }} /></Form.Item></Col>
            </Row>
            <Button type="primary" onClick={configure} loading={saving} disabled={!online}>
              {t('printer.configure')}
            </Button>
          </Form>
        </Card>
      </Col>
      <Col xs={24} lg={8}>
        <Card title={t('printer.diagnostics')} bordered={false} extra={<Button type="link" icon={<ReloadOutlined />} loading={loading} onClick={refresh} />}>
          {loading && <Spin size="small" style={{ marginBottom: 12 }} />}
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              {t('printer.service')}
              :
              {' '}
              <Tag color={online ? 'success' : 'error'}>{online ? t('printer.online') : t('printer.offline')}</Tag>
            </div>
            <div>
              {t('printer.device')}
              :
              {' '}
              <Tag color={configured ? 'success' : 'default'}>{configured ? t('printer.configured') : t('printer.notConfigured')}</Tag>
            </div>
            {status && (
              <div>
                {t('printer.readiness')}
                :
                {' '}
                <Tag color={status.ready ? 'success' : 'warning'}>{status.ready ? t('printer.ready') : t('printer.notReady')}</Tag>
              </div>
            )}
            {status?.message && <div>{status.message}</div>}
            {error && <Alert type="warning" message={error} showIcon />}
            {mode === 'USB' && <Alert type="info" message={t('printer.usbWindows')} showIcon />}
            <Button icon={<PrinterOutlined />} onClick={testPrint} loading={printing} disabled={!configured || status?.connected !== true || status?.ready !== true}>
              {t('printer.testPrint')}
            </Button>
          </Space>
        </Card>
      </Col>
      <Modal
        title={(
          <span style={{ color: '#cf1322' }}>
            <WarningOutlined />
            {' '}
            {t('config.advancedConfig')}
          </span>
        )}
        open={modalUrlVisible}
        onOk={saveUrl}
        onCancel={() => setModalUrlVisible(false)}
        okText={t('common.saveUrl')}
        cancelText={t('common.cancel')}
        okButtonProps={{ danger: true }}
        destroyOnClose
      >
        <Alert message={t('config.communicationWarning')} description={t('config.urlWarningDescription')} type="warning" showIcon style={{ marginBottom: 16 }} />
        <Form.Item label={t('printer.serviceUrl')} required>
          <Input value={novaUrlInput} onChange={event => setNovaUrlInput(event.target.value)} placeholder="http://localhost:43786" />
        </Form.Item>
      </Modal>
    </Row>
  )
}

export default RfidImpressoraConfiguracao
