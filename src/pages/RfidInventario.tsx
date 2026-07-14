import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation('rfid')

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

  const validarTagNoBackend = async (tid: string) => {
    try {
      const tidCodificado = encodeURIComponent(tid)
      const response = await axios.get(`/rfids/validar-tid/${tidCodificado}`)

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
      notificacao('error', t('notifications.serviceUnavailableTitle'), t('notifications.serviceUnavailableDescription'))
      return
    }

    isLendoRef.current = true
    setIsLendo(true)
    notificacao('success', t('notifications.readingStartedTitle'), t('notifications.readingStartedDescription'))

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
              tagsNovasParaValidar.forEach(tagApi => validarTagNoBackend(tagApi.TID))
            }
          }
        }
      } catch (error) {
        if (isLendoRef.current) {
          isLendoRef.current = false; setIsLendo(false);
          useRfidStore.getState().desconectar()
          notificacao('error', t('notifications.connectionLostTitle'), t('notifications.communicationStopped'))
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
      title: t('inventory.validationApi'), dataIndex: 'statusValidacao', key: 'statusValidacao', width: 150, render: (status: string) => {
        if (status === 'VALIDANDO') return <Tag icon={<SyncOutlined spin />} color="processing">{t('inventory.searching')}</Tag>
        if (status === 'VALIDO') return <Tag color="success" icon={<CheckCircleOutlined />}>{t('inventory.identified')}</Tag>
        if (status === 'INVALIDO') return <Tag color="warning" icon={<WarningOutlined />}>{t('inventory.unknown')}</Tag>
        return <Tag color="error" icon={<StopOutlined />}>{t('inventory.notIdentified')}</Tag>
      }
    },
    { title: t('inventory.tombo'), key: 'acervo', render: (_: any, record: TagLida) => record.statusValidacao === 'VALIDO' ? (<div><Text strong>{record.tomboHcf}</Text><br /><Text type="secondary" style={{ fontStyle: 'italic' }}>{record.nomeCientifico}</Text></div>) : record.statusValidacao === 'VALIDANDO' ? <Text type="secondary">{t('common.loading')}</Text> : <Text type="secondary">-</Text> },
    { title: t('inventory.collector'), dataIndex: 'coletorPrincipal', key: 'coletorPrincipal', render: (c: string) => c ? <Text>{c}</Text> : <Text type="secondary">-</Text> },
    { title: 'EPC', key: 'hardware', render: (_: any, record: TagLida) => (<div><Text strong><BarcodeOutlined style={{ marginRight: 4, color: '#1890ff' }} /> {record.epc}</Text><div style={{ color: '#8c8c8c', fontFamily: 'monospace', fontSize: '12px' }}><IdcardOutlined style={{ marginRight: 4 }} /> {record.tid}</div></div>) },
    { title: t('inventory.totalReads'), dataIndex: 'quantidade', key: 'quantidade', width: 100, align: 'center' as const, render: (qtd: number) => <Tag color="blue">{qtd}x</Tag> },
    { title: t('inventory.actions'), key: 'acao', width: 80, align: 'center' as const, render: (_: any, record: TagLida) => <Popconfirm title={t('inventory.removeQuestion')} onConfirm={() => removerTag(record.tid)} okText={t('common.yes')}><Button type="text" danger icon={<DeleteOutlined />} /></Popconfirm> }
  ]

  return (
    <div style={{ padding: '24px' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: '20px' }}>
        <Col><h2 style={{ fontWeight: 200, margin: 0 }}>{t('inventory.title')}</h2></Col>
        <Col>
          {!validandoHardware && (!hardwareOnline || statusConexao !== 'CONECTADO') && (
            <Tag color="error" icon={<DisconnectOutlined />} style={{ marginRight: 16 }}>{t('common.disconnectedService')}</Tag>
          )}
          <Button icon={<SettingOutlined />} onClick={() => history.push('/rfid-configuracao')} danger={!hardwareOnline}>{t('common.settings')}</Button>
        </Col>
      </Row>

      <Divider dashed />
      <RfidConnectionPanel />

      <Row gutter={[24, 24]}>
        <Col xs={24} md={8} xl={6}>
          <Card title={t('inventory.totalTagsRead')} bordered={false}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}><Statistic value={tagsLidas.length} valueStyle={{ fontSize: '48px', color: isLendo ? '#1890ff' : '#000' }} /></div>
            <Tooltip title={!hardwareOnline ? t('inventory.connectToStart') : ""}>
              <Button type="primary" size="large" block danger={isLendo} icon={isLendo ? <PauseCircleOutlined /> : <PlayCircleOutlined />} onClick={toggleLeitura} disabled={!hardwareOnline || validandoHardware || statusConexao !== 'CONECTADO'} style={{ marginBottom: 16 }}>
                {validandoHardware ? t('inventory.checking') : isLendo ? t('inventory.pauseInventory') : t('inventory.startInventory')}
              </Button>
            </Tooltip>
            <Popconfirm title={t('inventory.clearReadsQuestion')} onConfirm={limparLista} okText={t('common.yes')}><Button block icon={<ClearOutlined />} disabled={tagsLidas.length === 0 || isLendo}>{t('inventory.clearList')}</Button></Popconfirm>
          </Card>
        </Col>
        <Col xs={24} md={16} xl={18}>
          <Card title={<Space><BarcodeOutlined />{t('inventory.foundPhotos')}{isLendo && <Tag color="processing">{t('inventory.activelyReading')}</Tag>}</Space>} bordered={false}>
            <Table columns={columns} dataSource={tagsLidas} rowKey="tid" pagination={{ pageSize: 10 }} bordered size="middle" locale={{ emptyText: t('inventory.emptyTags') }} />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

const Text: React.FC<{ strong?: boolean, type?: 'secondary', style?: React.CSSProperties, children: React.ReactNode }> = ({ strong, type, style, children }) => (<span style={{ fontWeight: strong ? 'bold' : 'normal', color: type === 'secondary' ? 'rgba(0,0,0,0.45)' : 'inherit', ...style }}>{children}</span>)
export default withRouter(RfidInventario)
