import React, { useState, useEffect, useCallback } from 'react'
import {
  Row,
  Col,
  Divider,
  Card,
  Select,
  Button,
  Input,
  notification,
  Tag,
  Spin,
  Modal,
  Alert
} from 'antd'
import {
  ApiOutlined,
  CheckCircleOutlined,
  DisconnectOutlined,
  ReloadOutlined,
  EditOutlined,
  WarningOutlined,
  StopOutlined
} from '@ant-design/icons'
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
  const {
    apiUrl, tipoDispositivo, identificador,
    hardwareOnline, statusConexao,
    setConfig, conectar, desconectar, verificarHardware
  } = useRfidStore()

  const [modalUrlVisible, setModalUrlVisible] = useState<boolean>(false)
  const [novaUrlInput, setNovaUrlInput] = useState<string>('')

  const [infoSO, setInfoSO] = useState<string | null>(null)
  const [uptime, setUptime] = useState<string | null>(null)
  const [carregandoDiagnostico, setCarregandoDiagnostico] = useState<boolean>(true)

  const notificacao = (type: 'success' | 'warning' | 'error' | 'info', titulo: string, descricao: string) => {
    notification[type]({
      message: titulo,
      description: descricao,
      placement: 'topRight'
    })
  }

  const buscarDiagnostico = useCallback(async () => {
    setCarregandoDiagnostico(true)
    await verificarHardware()

    try {
      const response = await axios.get(`${apiUrl}/status`, { timeout: 3000 })
      if (response.status === 200) {
        setInfoSO(response.data.so || 'Sistema Local')
        setUptime(response.data.tempo_atividade || 'Uptime indisponível')
      }
    } catch (error) {
      setInfoSO(null)
      setUptime(null)
    } finally {
      setCarregandoDiagnostico(false)
    }
  }, [apiUrl, verificarHardware])

  useEffect(() => {
    buscarDiagnostico()
  }, [buscarDiagnostico])

  const handleTipoDispositivoChange = (value: string) => {
    setConfig({
      tipoDispositivo: value,
      identificador: getDefaultIdentifier(value)
    })
    if (statusConexao === 'CONECTADO') desconectar()
  }

  const handleIdentificadorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig({ identificador: e.target.value.trim() })
    if (statusConexao === 'CONECTADO') desconectar()
  }

  const handleConectar = async () => {
    if (statusConexao === 'CONECTADO') {
      notificacao('info', 'Aviso', 'O dispositivo já está conectado e pronto para uso.')
      return
    }

    const sucesso = await conectar()

    if (sucesso) {
      notificacao('success', 'Conectado', `Dispositivo (${tipoDispositivo}) inicializado com sucesso.`)
      buscarDiagnostico()
    } else {
      notificacao('error', 'Erro de Conexão', `Falha ao tentar inicializar o hardware. Verifique o serviço.`)
    }
  }

  const abrirModalEdicaoUrl = () => {
    setNovaUrlInput(apiUrl)
    setModalUrlVisible(true)
  }

  const salvarNovaUrl = () => {
    if (!novaUrlInput.trim()) {
      notificacao('warning', 'Atenção', 'O endereço não pode ficar vazio.')
      return
    }

    const cleanUrl = novaUrlInput.trim()
    setConfig({ apiUrl: cleanUrl })
    if (statusConexao === 'CONECTADO') desconectar()

    setModalUrlVisible(false)
    notificacao('info', 'Endereço atualizado', 'O endereço do serviço local foi alterado.')

    setTimeout(buscarDiagnostico, 100)
  }

  const renderStatusTag = () => {
    switch (statusConexao) {
      case 'CONECTADO':
        return <Tag color="success" icon={<CheckCircleOutlined />}>Hardware Pronto</Tag>
      case 'CONECTANDO':
        return <Tag color="processing" icon={<Spin size="small" />}> Inicializando...</Tag>
      default:
        return <Tag color="default" icon={<DisconnectOutlined />}>Desconectado</Tag>
    }
  }

  return (
    <div style={{ padding: '24px' }}>
      <Row>
        <Col span={24}>
          <h2 style={{ fontWeight: 200 }}>Configuração de Dispositivo RFID</h2>
        </Col>
      </Row>
      <Divider dashed />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Configuração" bordered={false} style={{ height: '100%' }}>

            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col span={24}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ color: '#8c8c8c' }}>Endereço do Serviço:</span>
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
                    Editar
                  </Button>
                </div>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <span>Dispositivo:</span>
                <Select
                  value={tipoDispositivo}
                  onChange={handleTipoDispositivoChange}
                  style={{ width: '100%', marginTop: 8 }}
                  disabled={!hardwareOnline && statusConexao === 'DESCONECTADO'}
                >
                  <Option value="CHAINWAY_NATIVE">Chainway R3</Option>
                  <Option value="HEXAPAD">Acura Hexapad</Option>
                  <Option value="MOCK">Emulador (MOCK)</Option>
                </Select>
              </Col>
              <Col xs={24} sm={12}>
                <span>Identificador:</span>
                <Input
                  value={identificador}
                  disabled
                  style={{ marginTop: 8 }}
                />
              </Col>
            </Row>

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
                  {statusConexao === 'CONECTADO' ? 'Hardware Inicializado' : 'Inicializar e Conectar'}
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Diagnóstico</span>
                <Button
                  type="link"
                  icon={<ReloadOutlined />}
                  onClick={buscarDiagnostico}
                  size="small"
                  loading={carregandoDiagnostico}
                />
              </div>
            }
            bordered={false}
            style={{ height: '100%', backgroundColor: '#fafafa' }}
          >
            {carregandoDiagnostico ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Spin size="large" />
                <div style={{ marginTop: 16, color: '#8c8c8c' }}>Testando comunicação...</div>
              </div>
            ) : !hardwareOnline && statusConexao === 'DESCONECTADO' ? (
              <Alert
                message={<span style={{ fontWeight: 'bold' }}>Serviço Inacessível</span>}
                description={
                  <div style={{ marginTop: 8 }}>
                    <p>Não foi possível realizar a comunicação com a API do dispositivo RFID.</p>
                    <b>Verifique:</b>
                    <ul style={{ paddingLeft: 16, marginTop: 4, marginBottom: 0 }}>
                      <li>Se o executável local está aberto.</li>
                      <li>Se o endereço do serviço está correto.</li>
                    </ul>
                  </div>
                }
                type="error"
                showIcon
                icon={<StopOutlined />}
              />
            ) : (
              <>
                <Row style={{ marginBottom: 16 }}>
                  <Col span={24}>
                    <span style={{ color: '#8c8c8c' }}>Status do Leitor:</span>
                    <div style={{ marginTop: 8 }}>
                      {renderStatusTag()}
                    </div>
                  </Col>
                </Row>

                <Divider dashed style={{ margin: '16px 0' }} />

                <Row style={{ marginBottom: 16 }}>
                  <Col span={24}>
                    <span style={{ color: '#8c8c8c' }}>Sistema Operacional:</span>
                    <div style={{ marginTop: 4, fontWeight: 500 }}>
                      {infoSO}
                    </div>
                  </Col>
                </Row>

                <Row>
                  <Col span={24}>
                    <span style={{ color: '#8c8c8c' }}>Tempo de Atividade (Uptime):</span>
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
        title={<span style={{ color: '#cf1322' }}><WarningOutlined /> Configuração Avançada</span>}
        visible={modalUrlVisible}
        onOk={salvarNovaUrl}
        onCancel={() => setModalUrlVisible(false)}
        okText="Salvar URL"
        cancelText="Cancelar"
        okButtonProps={{ danger: true }}
        destroyOnClose
      >
        <Alert
          message="Aviso de Comunicação"
          description="Apenas altere a URL da API se você tiver conhecimento da porta configurada na máquina hospedeira."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <p style={{ fontWeight: 500 }}>Endereço do Serviço Local:</p>
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
