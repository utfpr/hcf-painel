import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Row, Col, Divider, Card, Select, Button, notification, Spin, Descriptions, Alert, Tooltip, Image, Tag } from 'antd'
import { LinkOutlined, ScanOutlined, SettingOutlined, DisconnectOutlined } from '@ant-design/icons'
import axios from 'axios'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import debounce from 'lodash.debounce'
import RfidConnectionPanel from '../components/RfidConnectionPanel'
import { useRfidStore } from '../stores/useRfidStore'

const { Option } = Select

export interface TomboPendente {
  id: number
  tombo_hcf: string
  codigo_barra: string
  caminho_foto: string
  nome_cientifico?: string
  coletor_principal?: string
}

const RfidVinculacao: React.FC<RouteComponentProps> = ({ history }) => {
  const { apiUrl, identificador, hardwareOnline, validandoHardware, statusConexao, verificarHardware } = useRfidStore()

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
      notificacao('error', 'Erro', 'Falha ao buscar os tombos para vinculação.')
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

  const imagemAleatoriaFallback = useMemo(() => {
    const urls = [
      'https://api.hcf.cm.utfpr.edu.br/images/HCF000005517.JPG/resize?height=1800',
      'https://hcf.cm.utfpr.edu.br/not-found.jpg'
    ];

    return urls[Math.floor(Math.random() * urls.length)];
  }, [tomboSelecionado]);

  const iniciarVinculacao = async () => {
    if (!tomboSelecionado) return
    if (!hardwareOnline || statusConexao !== 'CONECTADO') {
      notificacao('warning', 'Dispositivo indisponível', 'Configure o dispositivo antes de gravar.')
      return
    }

    setIsGravando(true)

    try {
      setEtapaGravacao('Verificando comunicação com o Leitor RFID...')
      await verificarHardware()

      if (useRfidStore.getState().statusConexao !== 'CONECTADO') {
        throw new Error('Dispositivo offline')
      }
    } catch (error) {
      notificacao('error', 'Comunicação Perdida', 'O serviço RFID parou de responder.')
      setIsGravando(false)
      return
    }

    let vinculacaoId: number | null = null
    let epcGerado: string = ''
    let statusFinal: 'CONCLUIDO' | 'FALHA' = 'FALHA'
    let tidLido: string = ''

    try {
      setEtapaGravacao('Solicitando EPC para o servidor...')
      const responseInit = await axios.post('/rfids/iniciar-gravacao', { tombo_foto_id: tomboSelecionado.id })

      if (responseInit.status !== 200 && responseInit.status !== 201) throw new Error('Falha no servidor.')

      vinculacaoId = responseInit.data.rfid.id
      epcGerado = responseInit.data.rfid.epc
      setEtapaGravacao('Gravando RFID...')

      try {
        const responseWrite = await axios.post(`${apiUrl}/escrita/${identificador}`, { data: epcGerado })

        if (responseWrite.status === 200 && responseWrite.data.success === true) {
          tidLido = responseWrite.data.tid;
          statusFinal = 'CONCLUIDO';
        }
      } catch (hardwareError) {
        statusFinal = 'FALHA'
      }

      setEtapaGravacao('Sincronizando com o servidor...')
      await axios.put(`/rfids/finalizar-gravacao/${vinculacaoId}`, { status: statusFinal, tid: tidLido })

      if (statusFinal === 'CONCLUIDO') {
        notificacao('success', 'Gravação Concluída!', `RFID vinculado a ${tomboSelecionado.codigo_barra}.`)
        resetarTela()
      } else {
        notificacao('error', 'Falha', 'Não foi possível gravar na tag física.')
        setIsGravando(false)
      }
    } catch (error: any) {
      notificacao('error', 'Operação Abortada', error.message || 'Ocorreu um erro durante a vinculação.')
      setIsGravando(false)
    }
  }

  return (
    <div style={{ padding: '24px' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: '20px' }}>
        <Col><h2 style={{ fontWeight: 200, margin: 0 }}>Vinculação de Tag RFID</h2></Col>
        <Col>
          {!validandoHardware && (!hardwareOnline || statusConexao !== 'CONECTADO') && (
            <Tag color="error" icon={<DisconnectOutlined />} style={{ marginRight: 16 }}>Serviço Desconectado</Tag>
          )}
          <Button icon={<SettingOutlined />} onClick={() => history.push('/rfid-configuracao')} danger={!hardwareOnline}>
            Configurações RFID
          </Button>
        </Col>
      </Row>

      <Divider dashed />

      <RfidConnectionPanel />

      <Spin spinning={isGravando} tip={etapaGravacao} size="large">
        <Row gutter={[24, 24]}>
          <Col span={24}>
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
                options={tombos.map(t => ({ label: `${t.tombo_hcf} - ${t.codigo_barra}`, value: t.id }))}
              />
            </Card>
          </Col>

          <Col span={24}>
            <Card title="Confirmação" bordered={false} style={{ height: '100%' }}>
              {tomboSelecionado ? (
                <>
                  <Descriptions title="Detalhes" bordered size="small" column={1}>
                    <Descriptions.Item label="Tombo"><strong style={{ color: '#1890ff' }}>{tomboSelecionado.tombo_hcf}</strong></Descriptions.Item>
                    <Descriptions.Item label="Código de barras">{tomboSelecionado.codigo_barra}</Descriptions.Item>
                    <Descriptions.Item label="Nome científico">{tomboSelecionado.nome_cientifico || '-'}</Descriptions.Item>
                    <Descriptions.Item label="Coletor principal">{tomboSelecionado.coletor_principal || '-'}</Descriptions.Item>
                    <Descriptions.Item label="Foto">
                      <Image width={200} src={tomboSelecionado.caminho_foto || imagemAleatoriaFallback} alt="Foto do item" fallback="https://placehold.co/200x150" />
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
                      {validandoHardware ? 'Verificando Hardware...' : 'Iniciar Gravação'}
                    </Button>
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
