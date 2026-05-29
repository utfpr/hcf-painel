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

const { Option } = Select

const getInitialApiUrl = () => localStorage.getItem('rfid_api_url') || 'http://localhost:43785'
const getInitialIdentificador = () => localStorage.getItem('rfid_identificador') || 'chainway_native'
const getInitialTipoDispositivo = () => localStorage.getItem('rfid_tipo_dispositivo') || 'CHAINWAY_NATIVE'
const getInitialStatusConexao = (): 'DESCONECTADO' | 'CONECTANDO' | 'CONECTADO' => {
    const status = localStorage.getItem('rfid_status_conexao')
    return status === 'CONECTADO' ? 'CONECTADO' : 'DESCONECTADO'
}

const RfidConfiguracao: React.FC = () => {
    
    const [apiUrl, setApiUrl] = useState<string>(getInitialApiUrl())
    const [modalUrlVisible, setModalUrlVisible] = useState<boolean>(false)
    const [novaUrlInput, setNovaUrlInput] = useState<string>('')

    const [tipoDispositivo, setTipoDispositivo] = useState<string>(getInitialTipoDispositivo())
    const [identificador, setIdentificador] = useState<string>(getInitialIdentificador())
    
    const [apiOnline, setApiOnline] = useState<boolean>(false)
    const [verificandoApi, setVerificandoApi] = useState<boolean>(true)
    const [statusConexao, setStatusConexao] = useState<'DESCONECTADO' | 'CONECTANDO' | 'CONECTADO'>(getInitialStatusConexao())
    const [infoSO, setInfoSO] = useState<string | null>(null)
    const [uptime, setUptime] = useState<string | null>(null)

    const notificacao = (type: 'success' | 'warning' | 'error' | 'info', titulo: string, descricao: string) => {
        notification[type]({
            message: titulo,
            description: descricao,
            placement: 'topRight'
        })
    }

    const alterarStatusConexao = (novoStatus: 'DESCONECTADO' | 'CONECTANDO' | 'CONECTADO') => {
        setStatusConexao(novoStatus)
        localStorage.setItem('rfid_status_conexao', novoStatus)
    }

    const verificarStatusApi = useCallback(async () => {
        setVerificandoApi(true)
        try {
            const response = await axios.get(`${apiUrl}/status`, { timeout: 3000 })
            if (response.status === 200) {
                setApiOnline(true)
                setInfoSO(response.data.so || 'Sistema Local')
                setUptime(response.data.tempo_atividade || 'Uptime indisponível')
            }
        } catch (error) {
            setApiOnline(false)
            setInfoSO(null)
            setUptime(null)
            alterarStatusConexao('DESCONECTADO')
        } finally {
            setVerificandoApi(false)
        }
    }, [apiUrl])

    useEffect(() => {
        verificarStatusApi()
    }, [verificarStatusApi])

    const handleTipoDispositivoChange = (value: string) => {
        setTipoDispositivo(value)
        localStorage.setItem('rfid_tipo_dispositivo', value)

        if (value === 'MOCK') {
            setIdentificador('mock_device')
            localStorage.setItem('rfid_identificador', 'mock_device')
        } else if (value === 'CHAINWAY_NATIVE') {
            setIdentificador('chainway_native')
            localStorage.setItem('rfid_identificador', 'chainway_native')
        }
        alterarStatusConexao('DESCONECTADO') 
    }

    const handleConectar = async () => {
        if (!apiOnline) {
            notificacao('warning', 'Serviço Offline', 'Não é possível conectar ao hardware sem o serviço rodando.')
            return
        }

        if (statusConexao === 'CONECTADO') {
            notificacao('info', 'Aviso', 'O dispositivo já está conectado e pronto para uso.')
            return
        }

        alterarStatusConexao('CONECTANDO')

        try {
            const response = await axios.put(`${apiUrl}/configuracao`, {
                type: tipoDispositivo,
                id: identificador
            })

            if (response.status === 200 || response.status === 204) {
                localStorage.setItem('rfid_api_url', apiUrl)
                localStorage.setItem('rfid_identificador', identificador)
                localStorage.setItem('rfid_tipo_dispositivo', tipoDispositivo)

                alterarStatusConexao('CONECTADO')
                notificacao('success', 'Conectado', `Dispositivo (${tipoDispositivo}) inicializado com sucesso.`)
                verificarStatusApi()
            } else {
                alterarStatusConexao('DESCONECTADO')
                notificacao('warning', 'Falha na Inicialização', 'O dispositivo retornou um status inesperado.')
            }
        } catch (error) {
            alterarStatusConexao('DESCONECTADO')
            notificacao('error', 'Erro de Conexão', `Falha ao tentar inicializar o hardware.`)
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
        setApiUrl(cleanUrl)
        localStorage.setItem('rfid_api_url', cleanUrl)

        setModalUrlVisible(false)
        alterarStatusConexao('DESCONECTADO')
        notificacao('info', 'Endereço serviço atualizado', 'O endereço do serviço foi alterado')
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
                                    disabled={!apiOnline}
                                >
                                    <Option value="CHAINWAY_NATIVE">Chainway (Nativo)</Option>
                                    <Option value="MOCK">Emulador (MOCK)</Option>
                                </Select>
                            </Col>
                            <Col xs={24} sm={12}>
                                <span>Identificador:</span>
                                <Input
                                    value={identificador}
                                    onChange={(e) => {
                                        setIdentificador(e.target.value)
                                        localStorage.setItem('rfid_identificador', e.target.value)
                                    }}
                                    style={{ marginTop: 8 }}
                                    disabled 
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
                                    disabled={statusConexao === 'CONECTADO' || !apiOnline}
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
                                <span>Status</span>
                                
                                <Button 
                                    type="link" 
                                    icon={<ReloadOutlined />} 
                                    onClick={verificarStatusApi} 
                                    size="small" 
                                    loading={verificandoApi}
                                />
                            </div>
                        } 
                        bordered={false} 
                        style={{ height: '100%', backgroundColor: '#fafafa' }}
                    >
                        {verificandoApi ? (
                            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                <Spin size="large" />
                                <div style={{ marginTop: 16, color: '#8c8c8c' }}>Verificando comunicação...</div>
                            </div>
                        ) : !apiOnline ? (
                            <Alert
                                message={<span style={{ fontWeight: 'bold' }}>Fora do ar</span>}
                                description={
                                    <div style={{ marginTop: 8 }}>
                                        <p>Não foi possível realizar a comunicação com a api de dispositivo RFID.</p>
                                        <b>Por favor, verifique:</b>

                                        <ul style={{ paddingLeft: 16, marginTop: 4, marginBottom: 0 }}>
                                            <li>Se o executavel está aberto.</li>
                                            <li>Se a URL está correta.</li>
                                        </ul>
                                        
                                        <p style={{ marginTop: 12, marginBottom: 0 }}>
                                          Qualquer problema entre em contato com o administrador
                                        </p>
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
                                        <div style={{ marginTop: 8 }}>
                                            
                                        </div>
                                    </Col>
                                </Row>

                                <Row style={{ marginBottom: 16 }}>
                                    <Col span={24}>
                                        <span style={{ color: '#8c8c8c' }}>Dispositivo RFID:</span>
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
                                        <span style={{ color: '#8c8c8c' }}>Uptime:</span>
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
                okText="Ciente dos riscos"
                cancelText="Cancelar"
                okButtonProps={{ danger: true }}
                destroyOnClose
            >
                <Alert
                    message="Aviso Importante"
                    description="Apenas altere a URL da API se você tiver conhecimento técnico. Colocar uma url errada, fará com que o sistema não se comunique com o serviço corretamente."
                    type="warning"
                    showIcon
                    style={{ marginBottom: 16 }}
                />
                <p style={{ fontWeight: 500 }}>Endereço do Serviço:</p>
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
