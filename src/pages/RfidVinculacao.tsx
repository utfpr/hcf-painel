import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Row, Col, Divider, Card, Select, Button, notification, Spin, Descriptions, Alert, Tooltip, Image, Tag } from 'antd'
import { LinkOutlined, ScanOutlined, SettingOutlined, DisconnectOutlined } from '@ant-design/icons'
import axios from 'axios'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import debounce from 'lodash.debounce'
import RfidConnectionPanel from '../components/RfidConnectionPanel'
import { useRfidStore } from '../stores/useRfidStore'
import { fotosBaseUrl } from '../config/api'

const { Option } = Select

export interface TomboPendente {
  id: number
  tombo_hcf: string
  codigo_barra: string
  caminho_foto: string | null
  nome_cientifico?: string
  coletor_principal?: string
}

export interface EscritaRfidResponse {
  success?: boolean
  tid?: string
}

const URL_NAO_ENCONTRADA = 'https://hcf.cm.utfpr.edu.br/not-found.jpg'

const montarUrlFoto = (tombo: TomboPendente): string => {
  const codigoBarra = tombo.codigo_barra?.trim()
  const identificadorFoto = tombo.caminho_foto?.trim() || (codigoBarra ? codigoBarra + '.JPG' : '')

  if (!identificadorFoto) return URL_NAO_ENCONTRADA

  const baseUrl = fotosBaseUrl?.replace(/\/$/, '')
  if (!baseUrl) return URL_NAO_ENCONTRADA

  return baseUrl + '/' + identificadorFoto + '/resize?height=1800'
}

const RfidVinculacao: React.FC<RouteComponentProps> = ({ history }) => {
  const { apiUrl, identificador, hardwareOnline, validandoHardware, statusConexao, verificarHardware } = useRfidStore()
  const { t } = useTranslation('rfid')

  const [tombos, setTombos] = useState<TomboPendente[]>([])
  const [tomboSelecionado, setTomboSelecionado] = useState<TomboPendente | null>(null)
  const [loadingTombos, setLoadingTombos] = useState<boolean>(false)
  const [paginaAtual, setPaginaAtual] = useState<number>(1)
  const [hasMore, setHasMore] = useState<boolean>(true)
  const [termoBusca, setTermoBusca] = useState<string>('')

  const [isGravando, setIsGravando] = useState<boolean>(false)
  const [etapaGravacao, setEtapaGravacao] = useState<string>('')

  const notificacao = (type: 'success' | 'warning' | 'error' | 'info', titulo: string, descricao: string) => {
    notification[type]({ message: titulo, description: descricao, placement: 'topRight' })
  }

  useEffect(() => {
    verificarHardware()
    fetchTombos(1, '')
  }, [verificarHardware])

  const fetchTombos = async (page = 1, search = '') => {
    setLoadingTombos(true)
    try {
      const response = await axios.get('/rfids/tombos-pendentes', {
        params: { pagina: page, limite: 50, q: search }
      })
      if (response.status === 200) {
        const novosDados: TomboPendente[] = response.data.dados || []
        const meta = response.data.meta

        if (page === 1) {
          setTombos(novosDados)
        } else {
          setTombos(prev => [...prev, ...novosDados])
        }

        setHasMore(meta ? novosDados.length === meta.limite : novosDados.length === 50)
        setPaginaAtual(page)
      }
    } catch (error) {
      notificacao('error', t('common.error'), t('notifications.tombosFetchFailure'))
    } finally {
      setLoadingTombos(false)
    }
  }

  const handleSearch = useMemo(() => debounce((value: string) => {
    setTermoBusca(value)
    fetchTombos(1, value)
  }, 500), [])

  const handlePopupScroll = (e: any) => {
    const { target } = e
    if (target.scrollTop + target.offsetHeight >= target.scrollHeight - 10) {
      if (hasMore && !loadingTombos) fetchTombos(paginaAtual + 1, termoBusca)
    }
  }

  const handleTomboChange = (id: number) => {
    const selecionado = tombos.find(t => t.id === id)
    setTomboSelecionado(selecionado || null)
  }

  const resetarTela = () => {
    setTomboSelecionado(null)
    setIsGravando(false)
    setEtapaGravacao('')
    setTermoBusca('')
    fetchTombos(1, '')
  }


  const tidValido = (tid?: string | null): tid is string => Boolean(tid && tid.trim() && tid.trim().toUpperCase() !== 'N/A')


  const iniciarVinculacao = async () => {
    if (!tomboSelecionado) return
    if (!hardwareOnline || statusConexao !== 'CONECTADO') {
      notificacao('warning', t('notifications.deviceUnavailableTitle'), t('notifications.configureDeviceBeforeWrite'))
      return
    }

    setIsGravando(true)

    try {
      setEtapaGravacao(t('notifications.checkingReaderCommunication'))
      await verificarHardware()

      if (useRfidStore.getState().statusConexao !== 'CONECTADO') {
        throw new Error(t('notifications.deviceOffline'))
      }
    } catch (error) {
      notificacao('error', t('notifications.communicationLostTitle'), t('notifications.rfidServiceStopped'))
      setIsGravando(false)
      return
    }

    let vinculacaoId: number | null = null
    let epcGerado: string = ''
    let statusFinal: 'CONCLUIDO' | 'FALHA' = 'FALHA'
    let tidLido: string = ''

    try {
      setEtapaGravacao(t('notifications.requestingEpc'))
      const responseInit = await axios.post('/rfids/iniciar-gravacao', { tombo_foto_id: tomboSelecionado.id })

      if (responseInit.status !== 200 && responseInit.status !== 201) throw new Error(t('notifications.serverFailure'))

      vinculacaoId = responseInit.data.rfid.id
      epcGerado = responseInit.data.rfid.epc
      setEtapaGravacao(t('notifications.writingRfid'))

      try {
        const responseWrite = await axios.post<EscritaRfidResponse>(`${apiUrl}/escrita/${identificador}`, { data: epcGerado })
        const tidRetornado = responseWrite.data.tid

        if (responseWrite.status === 200 && responseWrite.data.success === true && tidValido(tidRetornado)) {
          tidLido = tidRetornado.trim()
          statusFinal = 'CONCLUIDO'
        } else {
          statusFinal = 'FALHA'
        }
      } catch (hardwareError) {
        statusFinal = 'FALHA'
      }

      setEtapaGravacao(t('notifications.syncingServer'))
      await axios.put(`/rfids/finalizar-gravacao/${vinculacaoId}`, { status: statusFinal, tid: tidLido })

      if (statusFinal === 'CONCLUIDO') {
        notificacao('success', t('notifications.writeCompletedTitle'), t('notifications.rfidLinked', { barcode: tomboSelecionado.codigo_barra }))
        resetarTela()
      } else {
        notificacao('error', t('common.failure'), t('notifications.physicalWriteFailure'))
        setIsGravando(false)
      }
    } catch (error: any) {
      notificacao('error', t('notifications.operationAbortedTitle'), error.message || t('notifications.linkError'))
      setIsGravando(false)
    }
  }

  return (
    <div style={{ padding: '24px' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: '20px' }}>
        <Col><h2 style={{ fontWeight: 200, margin: 0 }}>{t('link.title')}</h2></Col>
        <Col>
          {!validandoHardware && (!hardwareOnline || statusConexao !== 'CONECTADO') && (
            <Tag color="error" icon={<DisconnectOutlined />} style={{ marginRight: 16 }}>{t('common.disconnectedService')}</Tag>
          )}
          <Button icon={<SettingOutlined />} onClick={() => history.push('/rfid-configuracao')} danger={!hardwareOnline}>
            {t('common.rfidSettings')}
          </Button>
        </Col>
      </Row>

      <Divider dashed />

      <RfidConnectionPanel />

      <Spin spinning={isGravando} tip={etapaGravacao} size="large">
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Card title={t('link.selectPhoto')} bordered={false} style={{ height: '100%' }}>
              <Select
                showSearch
                placeholder={t('link.searchPlaceholder')}
                style={{ width: '100%', marginTop: 8 }}
                loading={loadingTombos}
                value={tomboSelecionado?.id}
                onChange={handleTomboChange}
                onSearch={handleSearch}
                onPopupScroll={handlePopupScroll}
                filterOption={false}
                notFoundContent={loadingTombos ? <Spin size="small" /> : t('link.noTomboFound')}
                options={tombos.map(t => ({ label: `${t.tombo_hcf} - ${t.codigo_barra}`, value: t.id }))}
              />
            </Card>
          </Col>

          <Col span={24}>
            <Card title={t('link.confirmation')} bordered={false} style={{ height: '100%' }}>
              {tomboSelecionado ? (
                <>
                  <Descriptions title={t('link.details')} bordered size="small" column={1}>
                    <Descriptions.Item label={t('conference.tombo')}><strong style={{ color: '#1890ff' }}>{tomboSelecionado.tombo_hcf}</strong></Descriptions.Item>
                    <Descriptions.Item label={t('link.barcode')}>{tomboSelecionado.codigo_barra}</Descriptions.Item>
                    <Descriptions.Item label={t('link.scientificName')}>{tomboSelecionado.nome_cientifico || '-'}</Descriptions.Item>
                    <Descriptions.Item label={t('link.mainCollector')}>{tomboSelecionado.coletor_principal || '-'}</Descriptions.Item>
                    <Descriptions.Item label={t('link.photo')}>
                      <Image width={200} src={montarUrlFoto(tomboSelecionado)} alt={t('link.photoAlt')} fallback={URL_NAO_ENCONTRADA} />
                    </Descriptions.Item>
                  </Descriptions>
                  <Divider dashed style={{ margin: '16px 0' }} />
                  <div style={{ textAlign: 'center' }}>
                    <Button
                      type="primary"
                      size="large"
                      icon={<ScanOutlined />}
                      onClick={iniciarVinculacao}
                      disabled={!hardwareOnline || validandoHardware || statusConexao !== 'CONECTADO'}
                      style={{
                        width: '100%', maxWidth: '300px',
                        backgroundColor: hardwareOnline ? '#52c41a' : '#d9d9d9',
                        borderColor: hardwareOnline ? '#52c41a' : '#d9d9d9',
                        color: hardwareOnline ? '#fff' : 'rgba(0,0,0,0.25)'
                      }}
                    >
                      {validandoHardware ? t('link.checkingHardware') : t('link.startWrite')}
                    </Button>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#bfbfbf' }}>
                  <LinkOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                  <p>{t('link.noLinkInfo')}</p>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  )
}

export default withRouter(RfidVinculacao)
