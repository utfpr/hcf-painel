import React, { useState, useEffect, useRef } from 'react'
import { Row, Col, Divider, Card, Button, notification, Table, Tag, Statistic, Space, Popconfirm, Tooltip } from 'antd'
import { PlayCircleOutlined, PauseCircleOutlined, DeleteOutlined, SettingOutlined, DisconnectOutlined, ClearOutlined, BarcodeOutlined, IdcardOutlined, SyncOutlined, CheckCircleOutlined, WarningOutlined, StopOutlined } from '@ant-design/icons'
import axios from 'axios'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import moment from 'moment'
import RfidConnectionPanel from '../components/RfidConnectionPanel'
import { useRfidStore } from '../stores/useRfidStore'

interface TagLida {
  epc: string
  epcHex: string
  tid: string
  primeiraLeitura: string
  quantidade: number
  statusValidacao: 'VALIDANDO' | 'VALIDO' | 'INVALIDO' | 'ERRO'
  tomboHcf?: string
  nomeCientifico?: string
  coletorPrincipal?: string
  statusRfid?: string
}

const RfidInventario: React.FC<RouteComponentProps> = ({ history }) => {
  const { apiUrl, identificador, hardwareOnline, validandoHardware, statusConexao, verificarHardware } = useRfidStore()

  const [isLendo, setIsLendo] = useState<boolean>(false)
  const [tagsLidas, setTagsLidas] = useState<TagLida[]>([])

  const isLendoRef = useRef<boolean>(false)
  const tidsProcessados = useRef<Set<string>>(new Set())

  const notificacao = (type: 'success' | 'warning' | 'error' | 'info', titulo: string, descricao: string) => {
    notification[type]({ message: titulo, description: descricao, placement: 'topRight' })
  }

  useEffect(() => {
    verificarHardware()
    return () => { isLendoRef.current = false }
  }, [verificarHardware])

  const validarTagNoBackend = async (epcLegivel: string, tid: string) => {
    try {
      const epcCodificado = encodeURIComponent(epcLegivel)
      const response = await axios.get(`/rfids/validar/${epcCodificado}`)

      if (response.status === 200 && response.data.valido) {
        const { tombo_hcf, nome_cientifico, coletor_principal, status_rfid } = response.data.dados
        setTagsLidas(prev => prev.map(tag =>
          tag.tid === tid ? { ...tag, statusValidacao: 'VALIDO', tomboHcf: tombo_hcf, nomeCientifico: nome_cientifico, coletorPrincipal: coletor_principal, statusRfid: status_rfid } : tag
        ))
      }
    } catch (error: any) {
      const statusFinal = error.response?.status === 404 ? 'INVALIDO' : 'ERRO'
      setTagsLidas(prev => prev.map(tag => tag.tid === tid ? { ...tag, statusValidacao: statusFinal } : tag))
    }
  }

  const toggleLeitura = async () => {
    if (!hardwareOnline || statusConexao !== 'CONECTADO') {
      notificacao('warning', 'Hardware Offline', 'Configure o leitor RFID antes de iniciar.')
      return
    }

    if (isLendoRef.current) {
      isLendoRef.current = false
      setIsLendo(false)
      notificacao('info', 'Leitura Pausada', 'O inventário foi interrompido.')
      return
    }

    try {
      await verificarHardware()
      if (useRfidStore.getState().statusConexao !== 'CONECTADO') throw new Error('Offline')
    } catch (error) {
      notificacao('error', 'Serviço indisponível', 'O serviço RFID não está respondendo.')
      return
    }

    isLendoRef.current = true
    setIsLendo(true)
    notificacao('success', 'Leitura Iniciada', 'Aproxime as etiquetas do leitor.')

    while (isLendoRef.current) {
      try {
        const response = await axios.get(`${apiUrl}/leitura-continua/${identificador}`, { timeout: 5000 })
        if (response.status === 200 && response.data.tags) {
          const tagsLidasApi = response.data.tags || []
          if (tagsLidasApi.length > 0) {
            const tagsNovasParaValidar: any[] = []
            const tidsExistentes: string[] = []

            tagsLidasApi.forEach((tagApi: any) => {
              if (tidsProcessados.current.has(tagApi.TID)) tidsExistentes.push(tagApi.TID)
              else { tidsProcessados.current.add(tagApi.TID); tagsNovasParaValidar.push(tagApi) }
            })

            if (tagsNovasParaValidar.length > 0 || tidsExistentes.length > 0) {
              setTagsLidas(prev => {
                const novasTags = [...prev]
                tidsExistentes.forEach(tid => {
                  const index = novasTags.findIndex(t => t.tid === tid)
                  if (index !== -1) novasTags[index].quantidade += 1
                })
                tagsNovasParaValidar.forEach(tagApi => {
                  novasTags.unshift({
                    epc: tagApi.EPC_NOT_HEX, epcHex: tagApi.EPC, tid: tagApi.TID,
                    primeiraLeitura: moment().format('DD/MM/YYYY HH:mm:ss'), quantidade: 1, statusValidacao: 'VALIDANDO'
                  })
                })
                return novasTags
              })
              tagsNovasParaValidar.forEach(tagApi => validarTagNoBackend(tagApi.EPC_NOT_HEX, tagApi.TID))
            }
          }
        }
      } catch (error) {
        if (isLendoRef.current) {
          isLendoRef.current = false; setIsLendo(false);
          useRfidStore.getState().desconectar()
          notificacao('error', 'Conexão Perdida', 'O serviço de comunicação RFID parou.')
          break
        }
      }
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }

  const limparLista = () => { tidsProcessados.current.clear(); setTagsLidas([]) }
  const removerTag = (tidParaRemover: string) => { tidsProcessados.current.delete(tidParaRemover); setTagsLidas(prev => prev.filter(t => t.tid !== tidParaRemover)) }

  const columns = [
    {
      title: 'Valicação API', dataIndex: 'statusValidacao', key: 'statusValidacao', width: 150, render: (status: string) => {
        if (status === 'VALIDANDO') return <Tag icon={<SyncOutlined spin />} color="processing">Buscando...</Tag>
        if (status === 'VALIDO') return <Tag color="success" icon={<CheckCircleOutlined />}>Identificado</Tag>
        if (status === 'INVALIDO') return <Tag color="warning" icon={<WarningOutlined />}>Desconhecido</Tag>
        return <Tag color="error" icon={<StopOutlined />}>Não identificado</Tag>
      }
    },
    { title: 'Tombo', key: 'acervo', render: (_: any, record: TagLida) => record.statusValidacao === 'VALIDO' ? (<div><Text strong>{record.tomboHcf}</Text><br /><Text type="secondary" style={{ fontStyle: 'italic' }}>{record.nomeCientifico}</Text></div>) : record.statusValidacao === 'VALIDANDO' ? <Text type="secondary">Carregando...</Text> : <Text type="secondary">-</Text> },
    { title: 'Coletor Principal', dataIndex: 'coletorPrincipal', key: 'coletorPrincipal', render: (c: string) => c ? <Text>{c}</Text> : <Text type="secondary">-</Text> },
    { title: 'EPC', key: 'hardware', render: (_: any, record: TagLida) => (<div><Text strong><BarcodeOutlined style={{ marginRight: 4, color: '#1890ff' }} /> {record.epc}</Text><div style={{ color: '#8c8c8c', fontFamily: 'monospace', fontSize: '12px' }}><IdcardOutlined style={{ marginRight: 4 }} /> {record.tid}</div></div>) },
    { title: 'Total leitora', dataIndex: 'quantidade', key: 'quantidade', width: 100, align: 'center' as const, render: (qtd: number) => <Tag color="blue">{qtd}x</Tag> },
    { title: 'Ações', key: 'acao', width: 80, align: 'center' as const, render: (_: any, record: TagLida) => <Popconfirm title="Remover?" onConfirm={() => removerTag(record.tid)} okText="Sim"><Button type="text" danger icon={<DeleteOutlined />} /></Popconfirm> }
  ]

  return (
    <div style={{ padding: '24px' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: '20px' }}>
        <Col><h2 style={{ fontWeight: 200, margin: 0 }}>Inventário RFID</h2></Col>
        <Col>
          {!validandoHardware && (!hardwareOnline || statusConexao !== 'CONECTADO') && (
            <Tag color="error" icon={<DisconnectOutlined />} style={{ marginRight: 16 }}>Serviço Desconectado</Tag>
          )}
          <Button icon={<SettingOutlined />} onClick={() => history.push('/rfid-configuracao')} danger={!hardwareOnline}>Configurações</Button>
        </Col>
      </Row>

      <Divider dashed />
      <RfidConnectionPanel />

      <Row gutter={[24, 24]}>
        <Col xs={24} md={8} xl={6}>
          <Card title="Total Tags Lidas" bordered={false}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}><Statistic value={tagsLidas.length} valueStyle={{ fontSize: '48px', color: isLendo ? '#1890ff' : '#000' }} /></div>
            <Tooltip title={!hardwareOnline ? "Conecte para iniciar." : ""}>
              <Button type="primary" size="large" block danger={isLendo} icon={isLendo ? <PauseCircleOutlined /> : <PlayCircleOutlined />} onClick={toggleLeitura} disabled={!hardwareOnline || validandoHardware || statusConexao !== 'CONECTADO'} style={{ marginBottom: 16 }}>
                {validandoHardware ? 'Verificando...' : isLendo ? 'Pausar Inventário' : 'Iniciar Inventário'}
              </Button>
            </Tooltip>
            <Popconfirm title="Limpar leituras?" onConfirm={limparLista} okText="Sim"><Button block icon={<ClearOutlined />} disabled={tagsLidas.length === 0 || isLendo}>Limpar Lista</Button></Popconfirm>
          </Card>
        </Col>
        <Col xs={24} md={16} xl={18}>
          <Card title={<Space><BarcodeOutlined />Fotos Encontradas{isLendo && <Tag color="processing">Lendo ativamente...</Tag>}</Space>} bordered={false}>
            <Table columns={columns} dataSource={tagsLidas} rowKey="tid" pagination={{ pageSize: 10 }} bordered size="middle" locale={{ emptyText: 'Nenhuma tag.' }} />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

const Text: React.FC<{ strong?: boolean, type?: 'secondary', style?: React.CSSProperties, children: React.ReactNode }> = ({ strong, type, style, children }) => (<span style={{ fontWeight: strong ? 'bold' : 'normal', color: type === 'secondary' ? 'rgba(0,0,0,0.45)' : 'inherit', ...style }}>{children}</span>)
export default withRouter(RfidInventario)
