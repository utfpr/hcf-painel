import React from 'react'
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
    apiUrl, tipoDispositivo, identificador,
    hardwareOnline, validandoHardware, statusConexao,
    setConfig, verificarHardware, conectar, desconectar
  } = useRfidStore()

  const notificacao = (type: 'success' | 'warning' | 'error' | 'info', titulo: string, descricao: string) => {
    notification[type]({ message: titulo, description: descricao, placement: 'topRight' })
  }

  const handleConectar = async () => {
    if (!apiUrl.trim()) {
      notificacao('warning', 'URL obrigatória', 'Informe o endereço da API local do RFID.')
      return
    }

    const sucesso = await conectar()
    if (sucesso) {
      notificacao('success', 'Leitor pronto', 'O dispositivo RFID foi inicializado com sucesso.')
    } else {
      notificacao('error', 'Falha na conexão', 'Não foi possível inicializar o leitor RFID.')
    }
  }

  const handleChangeApiUrl = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig({ apiUrl: e.target.value })
    if (statusConexao === 'CONECTADO') desconectar()
  }

  const handleChangeDispositivo = (value: string) => {
    setConfig({
      tipoDispositivo: value,
      identificador: getDefaultIdentifier(value)
    })
    if (statusConexao === 'CONECTADO') desconectar()
  }

  const handleChangeIdentificador = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig({ identificador: e.target.value })
    if (statusConexao === 'CONECTADO') desconectar()
  }

  if (hardwareOnline && statusConexao === 'CONECTADO' && !validandoHardware) {
    return (
      <Alert
        type="success"
        showIcon
        icon={<CheckCircleOutlined />}
        message={<Text strong>Leitor RFID pronto para uso</Text>}
        description={
          <Space size="middle" style={{ marginTop: 4 }}>
            <Text>Usando o dispositivo <strong>{tipoDispositivo}</strong></Text>
            <Button size="small" type="link" onClick={desconectar} danger>
              Desconectar / Alterar
            </Button>
          </Space>
        }
        style={{ marginBottom: 24, padding: '12px 20px' }}
      />
    )
  }

  return (
    <Alert
      type="warning"
      showIcon
      icon={<DisconnectOutlined />}
      message={<Text strong>Leitor RFID não está conectado</Text>}
      style={{ marginBottom: 24, padding: '16px 24px' }}
      description={
        <div style={{ marginTop: 16 }}>
          <Form layout="vertical">
            <Row gutter={[16, 16]} align="bottom">
              <Col xs={24} lg={8}>
                <Form.Item label="Endereço do serviço (Local)" style={{ marginBottom: 0 }}>
                  <Input
                    value={apiUrl}
                    onChange={handleChangeApiUrl}
                    placeholder="http://localhost:43785"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} lg={6}>
                <Form.Item label="Dispositivo" style={{ marginBottom: 0 }}>
                  <Select
                    value={tipoDispositivo}
                    onChange={handleChangeDispositivo}
                    style={{ width: '100%' }}
                  >
                    <Option value="CHAINWAY_NATIVE">Chainway (Nativo)</Option>
                    <Option value="MOCK">Emulador (MOCK)</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} lg={6}>
                <Form.Item label="Identificador" style={{ marginBottom: 0 }}>
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
                      title="Verificar status atual"
                    />
                    <Button
                      type="primary"
                      icon={<ApiOutlined />}
                      onClick={handleConectar}
                      loading={statusConexao === 'CONECTANDO'}
                      style={{ backgroundColor: '#faad14', borderColor: '#faad14', color: '#fff' }}
                    >
                      Conectar
                    </Button>
                  </Space>
                </Form.Item>
              </Col>
            </Row>
          </Form>

          <div style={{ marginTop: 12 }}>
            <Text type="secondary" style={{ fontSize: '13px' }}>
              * Ajuste os parâmetros acima e clique em conectar para liberar a tela.
            </Text>
          </div>
        </div>
      }
    />
  )
}

export default RfidConnectionPanel
