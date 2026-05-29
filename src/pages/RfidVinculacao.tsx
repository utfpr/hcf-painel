import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Row,
  Col,
  Divider,
  Card,
  Select,
  Button,
  notification,
  Spin,
  Descriptions,
  Alert,
  Tooltip,
  Image,
  Tag
} from 'antd'
import {
  LinkOutlined,
  ScanOutlined,
  SettingOutlined,
  ApiOutlined,
  DisconnectOutlined
} from '@ant-design/icons'
import axios from 'axios'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import debounce from 'lodash.debounce'

const { Option } = Select

const RfidVinculacao: React.FC<RouteComponentProps> = ({ history }) => {
  const [hardwareOnline, setHardwareOnline] = useState<boolean>(false)
  const [validandoHardware, setValidandoHardware] = useState<boolean>(true)

  const [tombos, setTombos] = useState<any[]>([])
  const [tomboSelecionado, setTomboSelecionado] = useState<any | null>(null)
  const [loadingTombos, setLoadingTombos] = useState<boolean>(false)
  const [paginaAtual, setPaginaAtual] = useState<number>(1)
  const [hasMore, setHasMore] = useState<boolean>(true)
  const [termoBusca, setTermoBusca] = useState<string>('')

  const [isGravando, setIsGravando] = useState<boolean>(false)
  const [etapaGravacao, setEtapaGravacao] = useState<string>('')

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
    fetchTombos(1, '')
  }, [verificarHardware])


  const fetchTombos = async (page = 1, search = '') => {
    setLoadingTombos(true)
    try {
      const response = await axios.get('/rfids/tombos-pendentes', {
        params: { pagina: page, limite: 50, q: search }
      })
      if (response.status === 200) {
        const novosDados = response.data.dados || []
        const meta = response.data.meta

        if (page === 1) {
          setTombos(novosDados)
        } else {
          setTombos(prev => [...prev, ...novosDados])
        }

        if (meta) {
          setHasMore(novosDados.length === meta.limite)
        } else {
          setHasMore(novosDados.length === 50)
        }
        setPaginaAtual(page)
      }
    } catch (error) {
      notificacao('error', 'Erro', 'Falha ao buscar os tombos para vinculação.')
    } finally {
      setLoadingTombos(false)
    }
  }

  const handleSearch = useMemo(() => {
    const loadOptions = (value: string) => {
      setTermoBusca(value)
      fetchTombos(1, value)
    }
    return debounce(loadOptions, 500)
  }, [])

  const handlePopupScroll = (e: any) => {
    const { target } = e
    if (target.scrollTop + target.offsetHeight >= target.scrollHeight - 10) {
      if (hasMore && !loadingTombos) {
        fetchTombos(paginaAtual + 1, termoBusca)
      }
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

  const iniciarVinculacao = async () => {
    if (!tomboSelecionado) return
    if (!hardwareOnline) {
      notificacao('warning', 'Dispositivo indisponível', 'Por favor, configure o dispositivo antes de iniciar a gravação.')
      return
    }

    setIsGravando(true)

    const localApiUrl = localStorage.getItem('rfid_api_url') || 'http://localhost:43785'
    const identificador = localStorage.getItem('rfid_identificador') || 'chainway_native'

    try {
      setEtapaGravacao('Verificando comunicação com o Leitor RFID...')
      await axios.get(`${localApiUrl}/status`, { timeout: 2000 })
    } catch (error) {
      notificacao('error', 'Comunicação Perdida', 'O serviço RFID parou de responder.')
      setHardwareOnline(false)
      setIsGravando(false)
      return
    }

    let vinculacaoId: number | null = null
    let epcGerado: string = ''
    let statusFinal: 'CONCLUIDO' | 'FALHA' = 'FALHA'
    let tidLido: string = ''

    try {
      setEtapaGravacao('Solicitando EPC para o servidor...')
      const responseInit = await axios.post('/rfids/iniciar-gravacao', {
        tombo_foto_id: tomboSelecionado.id
      })

      if (responseInit.status !== 200 && responseInit.status !== 201) {
        throw new Error('Falha ao iniciar a gravação no servidor.')
      }

      vinculacaoId = responseInit.data.rfid.id
      epcGerado = responseInit.data.rfid.epc

      setEtapaGravacao('Gravando RFID...')

      try {
        const responseWrite = await axios.post(`${localApiUrl}/escrita/${identificador}`, {
          data: epcGerado
        })

        if (responseWrite.status === 200 && responseWrite.data.success === true) {
          statusFinal = 'CONCLUIDO'
          //tidLido = responseWrite.data.tid
        } else {
          statusFinal = 'FALHA'
        }

      } catch (hardwareError: any) {
        statusFinal = 'FALHA'
      }

      setEtapaGravacao('Sincronizando com o servidor...')

      await axios.put(`/rfids/finalizar-gravacao/${vinculacaoId}`, {
        status: statusFinal,
        tid: tidLido
      })

      if (statusFinal === 'CONCLUIDO') {
        notificacao('success', 'Gravação Concluída!', `RFID foi vinculada a ${tomboSelecionado.codigo_barra}.`)
        resetarTela()
      } else {
        notificacao('error', 'Falha na Leitura/Escrita', 'Não foi possível gravar os dados na tag física. Tente novamente.')
        setIsGravando(false)
      }

    } catch (error: any) {
      console.error(error)
      notificacao('error', 'Operação Abortada', error.message || 'Ocorreu um erro durante a vinculação.')
      setIsGravando(false)
    }
  }

  return (
    <div style={{ padding: '24px' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: '20px' }}>
        <Col>
          <h2 style={{ fontWeight: 200, margin: 0 }}>Vinculação de Tag RFID</h2>
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

      <Spin spinning={isGravando} tip={etapaGravacao} size="large">
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Card title="Selecionar foto" bordered={false} style={{ height: '100%' }}>
              <Select
                showSearch
                placeholder="Pesquisar por tombo/codigo de barras"
                style={{ width: '100%', marginTop: 8 }}
                loading={loadingTombos}
                value={tomboSelecionado?.id}
                onChange={handleTomboChange}
                onSearch={handleSearch}
                onPopupScroll={handlePopupScroll}
                filterOption={false}
                notFoundContent={loadingTombos ? <Spin size="small" /> : 'Nenhum tombo encontrado'}
                options={tombos.map(t => ({
                  label: `${t.tombo_hcf} - ${t.codigo_barra}`,
                  value: t.id
                }))}
              />
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card title="Confirmação" bordered={false} style={{ height: '100%' }}>
              {tomboSelecionado ? (
                <>
                  <Descriptions title="Detalhes" bordered size="small" column={1}>
                    <Descriptions.Item label="Tombo">
                      <strong style={{ color: '#1890ff' }}>
                        {tomboSelecionado.tombo_hcf}
                      </strong>
                    </Descriptions.Item>

                    <Descriptions.Item label="Código de barras">
                      {tomboSelecionado.codigo_barra}
                    </Descriptions.Item>

                    <Descriptions.Item label="Foto">
                      <Image
                        width={200}
                        src={tomboSelecionado.caminho_foto || 'https://placehold.co/200x150'}
                        alt="Foto do item"
                        fallback="https://placehold.co/200x150"
                      />
                    </Descriptions.Item>
                  </Descriptions>

                  <Divider dashed style={{ margin: '16px 0' }} />

                  <div style={{ textAlign: 'center' }}>
                    <Tooltip
                      title={!hardwareOnline ? "Verifique as Configurações antes de gravar." : ""}
                      color="red"
                    >
                      <Button
                        type="primary"
                        size="large"
                        icon={<ScanOutlined />}
                        onClick={iniciarVinculacao}
                        disabled={!hardwareOnline || validandoHardware}
                        style={{
                          width: '100%',
                          maxWidth: '300px',
                          backgroundColor: hardwareOnline ? '#52c41a' : '#d9d9d9',
                          borderColor: hardwareOnline ? '#52c41a' : '#d9d9d9',
                          color: hardwareOnline ? '#fff' : 'rgba(0, 0, 0, 0.25)'
                        }}
                      >
                        {validandoHardware ? 'Verificando Hardware...' : 'Iniciar Gravação'}
                      </Button>
                    </Tooltip>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#bfbfbf' }}>
                  <LinkOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                  <p>Sem informações para vinculação.</p>
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
