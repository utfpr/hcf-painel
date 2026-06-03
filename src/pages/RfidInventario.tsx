import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  Row,
  Col,
  Divider,
  Card,
  Button,
  notification,
  Table,
  Tag,
  Statistic,
  Space,
  Popconfirm,
  Tooltip
} from 'antd'
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  DeleteOutlined,
  SettingOutlined,
  DisconnectOutlined,
  ClearOutlined,
  BarcodeOutlined,
  IdcardOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  StopOutlined
} from '@ant-design/icons'
import axios from 'axios'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import moment from 'moment'

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
  const [hardwareOnline, setHardwareOnline] = useState<boolean>(false)
  const [validandoHardware, setValidandoHardware] = useState<boolean>(true)

  const [isLendo, setIsLendo] = useState<boolean>(false)
  const [tagsLidas, setTagsLidas] = useState<TagLida[]>([])

  const isLendoRef = useRef<boolean>(false)
  const tidsProcessados = useRef<Set<string>>(new Set())

  const notificacao = (type: 'success' | 'warning' | 'error' | 'info', titulo: string, descricao: string) => {
    notification[type]({ message: titulo, description: descricao, placement: 'topRight' })
  }

  const verificarHardware = useCallback(async () => {
    setValidandoHardware(true)
    const localApiUrl = localStorage.getItem('rfid_api_url') || 'http://localhost:43785'
    try {
      const response = await axios.get(`${localApiUrl}/status`, { timeout: 2000 })
      if (response.status === 200) {
        setHardwareOnline(true)
      } else {
        setHardwareOnline(false)
      }
    } catch (error) {
      setHardwareOnline(false)
    } finally {
      setValidandoHardware(false)
    }
  }, [])

  useEffect(() => {
    verificarHardware()
    return () => {
      isLendoRef.current = false
    }
  }, [verificarHardware])

  const validarTagNoBackend = async (epcLegivel: string, tid: string) => {
    try {
      const epcCodificado = encodeURIComponent(epcLegivel)
      const response = await axios.get(`/rfids/validar/${epcCodificado}`)

      if (response.status === 200 && response.data.valido) {
        const { tombo_hcf, nome_cientifico, coletor_principal, status_rfid } = response.data.dados

        setTagsLidas(prevTags => prevTags.map(tag =>
          tag.tid === tid
            ? {
              ...tag,
              statusValidacao: 'VALIDO',
              tomboHcf: tombo_hcf,
              nomeCientifico: nome_cientifico,
              coletorPrincipal: coletor_principal,
              statusRfid: status_rfid
            }
            : tag
        ))
      }
    } catch (error: any) {
      const statusFinal = error.response && error.response.status === 404 ? 'INVALIDO' : 'ERRO'

      setTagsLidas(prevTags => prevTags.map(tag =>
        tag.tid === tid
          ? { ...tag, statusValidacao: statusFinal }
          : tag
      ))
    }
  }

  const toggleLeitura = async () => {
    if (!hardwareOnline) {
      notificacao('warning', 'Hardware Offline', 'O serviço RFID não está respondendo.')
      return
    }

    if (isLendoRef.current) {
      isLendoRef.current = false
      setIsLendo(false)
      notificacao('info', 'Leitura Pausada', 'O inventário foi interrompido.')
      return
    }

    isLendoRef.current = true
    setIsLendo(true)
    notificacao('success', 'Leitura Iniciada', 'Aproxime as etiquetas do leitor.')

    const localApiUrl = localStorage.getItem('rfid_api_url') || 'http://localhost:43785'
    const identificador = localStorage.getItem('rfid_identificador') || 'chainway_native'

    while (isLendoRef.current) {
      try {
        const response = await axios.get(`${localApiUrl}/leitura-continua/${identificador}`, {
          timeout: 5000
        })

        if (response.status === 200 && response.data.tags) {
          const tagsLidasApi = response.data.tags || []

          if (tagsLidasApi.length > 0) {
            const tagsNovasParaValidar: any[] = []
            const tidsExistentesParaIncrementar: string[] = []

            tagsLidasApi.forEach((tagApi: any) => {
              if (tidsProcessados.current.has(tagApi.TID)) {
                tidsExistentesParaIncrementar.push(tagApi.TID)
              } else {
                tidsProcessados.current.add(tagApi.TID)
                tagsNovasParaValidar.push(tagApi)
              }
            })

            if (tagsNovasParaValidar.length > 0 || tidsExistentesParaIncrementar.length > 0) {
              setTagsLidas(prevTags => {
                const novasTags = [...prevTags]

                tidsExistentesParaIncrementar.forEach(tid => {
                  const index = novasTags.findIndex(t => t.tid === tid)
                  if (index !== -1) novasTags[index].quantidade += 1
                })

                tagsNovasParaValidar.forEach(tagApi => {
                  novasTags.unshift({
                    epc: tagApi.EPC_NOT_HEX,
                    epcHex: tagApi.EPC,
                    tid: tagApi.TID,
                    primeiraLeitura: moment().format('DD/MM/YYYY HH:mm:ss'),
                    quantidade: 1,
                    statusValidacao: 'VALIDANDO'
                  })
                })

                return novasTags
              })

              tagsNovasParaValidar.forEach(tagApi => {
                validarTagNoBackend(tagApi.EPC_NOT_HEX, tagApi.TID)
              })
            }
          }
        }
      } catch (error: any) {
        if (!error.response && isLendoRef.current) {
          isLendoRef.current = false
          setIsLendo(false)
          setHardwareOnline(false)
          notificacao('error', 'Conexão Perdida', 'O serviço de comunicação RFID parou de responder.')
          break
        }
      }

      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }

  const limparLista = () => {
    tidsProcessados.current.clear()
    setTagsLidas([])
  }

  const removerTag = (tidParaRemover: string) => {
    tidsProcessados.current.delete(tidParaRemover)
    setTagsLidas(prev => prev.filter(t => t.tid !== tidParaRemover))
  }

  const columns = [
    {
      title: 'Sistema (Validação)',
      dataIndex: 'statusValidacao',
      key: 'statusValidacao',
      width: 150,
      render: (status: string) => {
        if (status === 'VALIDANDO') return <Tag icon={<SyncOutlined spin />} color="processing">Buscando...</Tag>
        if (status === 'VALIDO') return <Tag color="success" icon={<CheckCircleOutlined />}>Identificado</Tag>
        if (status === 'INVALIDO') return <Tag color="warning" icon={<WarningOutlined />}>Desconhecido</Tag>
        return <Tag color="error" icon={<StopOutlined />}>Erro API</Tag>
      }
    },
    {
      title: 'Dados do Acervo (Tombo)',
      key: 'acervo',
      render: (_: any, record: TagLida) => {
        if (record.statusValidacao === 'VALIDO') {
          return (
            <div>
              <Text strong style={{ fontSize: '15px' }}>{record.tomboHcf}</Text>
              <br />
              <Text type="secondary" style={{ fontStyle: 'italic' }}>{record.nomeCientifico}</Text>
            </div>
          )
        }
        if (record.statusValidacao === 'VALIDANDO') {
          return <Text type="secondary">Carregando dados...</Text>
        }
        return <Text type="secondary">-</Text>
      }
    },
    {
      title: 'Coletor Principal',
      dataIndex: 'coletorPrincipal',
      key: 'coletorPrincipal',
      render: (coletor: string) => coletor ? <Text>{coletor}</Text> : <Text type="secondary">-</Text>
    },
    {
      title: 'Hardware (Série / EPC)',
      key: 'hardware',
      render: (_: any, record: TagLida) => (
        <div>
          <div style={{ marginBottom: 4 }}>
            <Text strong><BarcodeOutlined style={{ marginRight: 4, color: '#1890ff' }} /> {record.epc}</Text>
          </div>
          <div style={{ color: '#8c8c8c', fontFamily: 'monospace', fontSize: '12px' }}>
            <IdcardOutlined style={{ marginRight: 4 }} /> {record.tid}
          </div>
        </div>
      )
    },
    {
      title: 'Leituras',
      dataIndex: 'quantidade',
      key: 'quantidade',
      width: 100,
      align: 'center' as const,
      render: (qtd: number) => <Tag color="blue">{qtd}x</Tag>
    },
    {
      title: 'Ação',
      key: 'acao',
      width: 80,
      align: 'center' as const,
      render: (_: any, record: TagLida) => (
        <Popconfirm
          title="Remover tag da lista?"
          onConfirm={() => removerTag(record.tid)}
          okText="Sim"
          cancelText="Não"
        >
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      )
    }
  ]

  return (
    <div style={{ padding: '24px' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: '20px' }}>
        <Col>
          <h2 style={{ fontWeight: 200, margin: 0 }}>Inventário RFID</h2>
        </Col>
        <Col>
          {!validandoHardware && !hardwareOnline && (
            <Tag color="error" icon={<DisconnectOutlined />} style={{ marginRight: 16 }}>
              Serviço RFID Desconectado
            </Tag>
          )}
          <Button
            icon={<SettingOutlined />}
            onClick={() => history.push('/rfid-configuracao')}
            danger={!hardwareOnline && !validandoHardware}
          >
            Configurações RFID
          </Button>
        </Col>
      </Row>

      <Divider dashed />

      <Row gutter={[24, 24]}>
        <Col xs={24} md={8} xl={6}>
          <Card title="Controles" bordered={false} style={{ height: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Statistic
                title="Tags Únicas Lidas"
                value={tagsLidas.length}
                valueStyle={{ fontSize: '48px', color: isLendo ? '#1890ff' : '#000' }}
              />
            </div>

            <Tooltip title={!hardwareOnline ? "Conecte o hardware para iniciar." : ""}>
              <Button
                type="primary"
                size="large"
                block
                danger={isLendo}
                icon={isLendo ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                onClick={toggleLeitura}
                disabled={!hardwareOnline || validandoHardware}
                style={{
                  marginBottom: 16,
                  backgroundColor: isLendo ? '#ff4d4f' : '#52c41a',
                  borderColor: isLendo ? '#ff4d4f' : '#52c41a',
                }}
              >
                {validandoHardware ? 'Verificando...' : isLendo ? 'Pausar Inventário' : 'Iniciar Inventário'}
              </Button>
            </Tooltip>

            <Popconfirm
              title="Tem certeza que deseja limpar todas as leituras?"
              onConfirm={limparLista}
              okText="Sim, limpar"
              cancelText="Não"
            >
              <Button
                block
                icon={<ClearOutlined />}
                disabled={tagsLidas.length === 0 || isLendo}
              >
                Limpar Lista
              </Button>
            </Popconfirm>
          </Card>
        </Col>

        <Col xs={24} md={16} xl={18}>
          <Card
            title={
              <Space>
                <BarcodeOutlined />
                Acervo Encontrado em Sessão
                {isLendo && <Tag color="processing" style={{ marginLeft: 8 }}>Lendo ativamente...</Tag>}
              </Space>
            }
            bordered={false}
          >
            <Table
              columns={columns}
              dataSource={tagsLidas}
              rowKey="tid"
              pagination={{ pageSize: 10 }}
              bordered
              size="middle"
              locale={{ emptyText: 'Nenhuma tag lida até o momento.' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

const Text: React.FC<{ strong?: boolean, type?: 'secondary', style?: React.CSSProperties, children: React.ReactNode }> = ({ strong, type, style, children }) => (
  <span style={{
    fontWeight: strong ? 'bold' : 'normal',
    color: type === 'secondary' ? 'rgba(0, 0, 0, 0.45)' : 'inherit',
    ...style
  }}>
    {children}
  </span>
)

export default withRouter(RfidInventario)
