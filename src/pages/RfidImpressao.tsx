import React, {
  useCallback, useEffect, useRef, useState
} from 'react'

import {
  Alert, Button, Card, Image, Modal, notification, Space, Table, Tabs, Tag
} from 'antd'
import axios from 'axios'
import { useTranslation } from 'react-i18next'

import {
  PlayCircleOutlined, PrinterOutlined, ReloadOutlined, StopOutlined
} from '@ant-design/icons'

import RfidListaConferenciaFiltros from '../components/rfid-conferencia/RfidListaConferenciaFiltros'
import { FiltrosRfids } from '../components/rfid-conferencia/types'
import RfidConnectionPanel from '../components/RfidConnectionPanel'
import { fotosBaseUrl } from '../config/api'
import { PrinterMode, usePrinterStore } from '../stores/usePrinterStore'
import { useRfidStore } from '../stores/useRfidStore'

interface FotoPendente {
  id: number
  tombo_hcf: string
  codigo_barra: string
  caminho_foto: string | null
  genero: string
  nome_cientifico: string
  coletor_principal: string
  nome_popular: string
  data_coleta: string
}

interface Leitura {
  tid: string
  epc: string
  tombo_hcf?: string
  codigo_barra?: string
  status: 'VALIDANDO' | 'CONCLUIDO' | 'REPETIDA' | 'INVALIDA' | 'ERRO'
  mensagem?: string
}

const printerId = (mode: PrinterMode) => ({
  TCP: 'zebra_tcp', USB: 'zebra_usb', MOCK: 'mock'
})[mode]

const fotoUrl = (foto: FotoPendente) => {
  const nome = foto.caminho_foto?.trim() || `${foto.codigo_barra}.JPG`
  return `${fotosBaseUrl?.replace(/\/$/, '')}/${nome}/resize?height=300`
}

const erroApi = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { erro?: string; message?: string } | undefined
    return data?.erro || data?.message || error.message
  }

  return error instanceof Error ? error.message : String(error)
}

const RfidImpressao: React.FC = () => {
  const { t } = useTranslation('rfid')
  const printer = usePrinterStore()
  const reader = useRfidStore()
  const [filtros, setFiltros] = useState<FiltrosRfids>({})
  const [filtroPendente, setFiltroPendente] = useState(false)
  const [fotos, setFotos] = useState<FotoPendente[]>([])
  const [pagina, setPagina] = useState(1)
  const [limite, setLimite] = useState(20)
  const [total, setTotal] = useState(0)
  const [carregando, setCarregando] = useState(false)
  const [imprimindo, setImprimindo] = useState(false)
  const [lendo, setLendo] = useState(false)
  const [leituras, setLeituras] = useState<Leitura[]>([])
  const lendoRef = useRef(false)
  const processadosRef = useRef<Set<string>>(new Set())

  const carregar = useCallback(async (f: FiltrosRfids, p: number, l: number) => {
    setCarregando(true)

    try {
      const response = await axios.get<{ dados: FotoPendente[]; meta: { total: number } }>('/rfids/tombos-pendentes', {
        params: {
          ...f, pagina: p, limite: l
        }
      })

      setFotos(response.data.dados)
      setTotal(response.data.meta.total)
      setPagina(p)
      setLimite(l)
    } catch {
      notification.error({ message: t('print.fetchError') })
    } finally {
      setCarregando(false)
    }
  }, [t])

  useEffect(() => {
    void carregar({}, 1, 20)
  }, [carregar])

  useEffect(() => () => {
    lendoRef.current = false
  }, [])

  const imprimir = async () => {
    if (!total || imprimindo) {
      return
    }

    setImprimindo(true)

    try {
      const baseUrl = printer.apiUrl.replace(/\/$/, '')
      const id = printerId(printer.mode)
      const lista = await axios.get<{ printers: Array<{ id: string }> }>(`${baseUrl}/printers`, { timeout: 5000 })

      if (!lista.data.printers.some(item => item.id === id)) {
        throw new Error(t('print.printerRequired'))
      }

      const preparado = await axios.post<{ tags: Array<FotoPendente & { epc: string }>; total: number }>('/rfids/preparar-impressao', filtros)
      const labels = preparado.data.tags.map(item => ({
        epc: item.epc,
        data: {
          hcf: String(item.tombo_hcf),
          barcode: item.codigo_barra,
          popularName: item.nome_popular,
          scientificName: item.nome_cientifico,
          collector: item.coletor_principal,
          collectionDate: item.data_coleta
        }
      }))

      if (!labels.length) {
        throw new Error(t('print.noPending'))
      }

      const enviado = await axios.post<{ success: boolean; total: number }>(`${baseUrl}/printers/${id}/print/rfid-batch`, { labels }, { timeout: 120000 })
      if (!enviado.data.success || enviado.data.total !== labels.length) {
        throw new Error(t('print.sendError'))
      }

      notification.success({ message: t('print.sent', { total: labels.length }) })
      await carregar(filtros, 1, limite)
    } catch (error: unknown) {
      notification.error({ message: t('print.sendError'), description: erroApi(error) })
    } finally {
      setImprimindo(false)
    }
  }

  const confirmarImpressao = () => {
    Modal.confirm({
      title: t('print.confirmTitle'),
      content: t('print.confirmDescription', { total }),
      okText: t('print.send'),
      cancelText: t('common.cancel'),
      onOk: imprimir
    })
  }

  const registrarLeitura = async (tag: { TID?: string; EPC?: string; EPC_NOT_HEX?: string }) => {
    const tid = tag.TID?.trim() || ''
    const epcFormatado = tag.EPC_NOT_HEX?.trim() || ''
    const epc = /^[0-9A-F]{24}$/i.test(tag.EPC?.trim() || '') ? tag.EPC!.trim() : epcFormatado || tag.EPC?.trim() || ''

    if (!tid || processadosRef.current.has(tid)) {
      return
    }

    processadosRef.current.add(tid)
    setLeituras(prev => [
      {
        tid, epc, status: 'VALIDANDO'
      },
      ...prev
    ])

    try {
      const response = await axios.post<{ tombo_hcf: string; codigo_barra: string; repetida: boolean }>('/rfids/confirmar-leitura-impressa', { tid, epc })
      setLeituras(prev => prev.map(item => item.tid === tid
        ? {
          ...item,
          tombo_hcf: response.data.tombo_hcf,
          codigo_barra: response.data.codigo_barra,
          status: response.data.repetida ? 'REPETIDA' : 'CONCLUIDO'
        }
        : item))
    } catch (error: unknown) {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined
      const invalida = [
        400,
        404,
        409
      ].includes(status || 0)
      setLeituras(prev => prev.map(item => item.tid === tid
        ? {
          ...item,
          status: invalida ? 'INVALIDA' : 'ERRO',
          mensagem: erroApi(error) || t('print.validationError')
        }
        : item))
      if (!invalida) processadosRef.current.delete(tid)
    }
  }

  const alternarLeitura = async () => {
    if (lendoRef.current) {
      lendoRef.current = false
      setLendo(false)
      return
    }

    await reader.verificarHardware()
    if (useRfidStore.getState().statusConexao !== 'CONECTADO') {
      notification.warning({ message: t('print.readerRequired') })
      return
    }

    lendoRef.current = true
    setLendo(true)

    while (lendoRef.current) {
      try {
        const response = await axios.get<{ tags: Array<{ TID?: string; EPC?: string; EPC_NOT_HEX?: string }> }>(`${reader.apiUrl}/leitura-continua/${reader.identificador}`, { timeout: 5000 })
        const tags = response.data.tags || []
        await Promise.all(tags.map(registrarLeitura))
      } catch {
        lendoRef.current = false
        setLendo(false)
        notification.error({ message: t('print.readerError') })
      }
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontWeight: 200 }}>{t('print.title')}</h2>
      <Tabs
        defaultActiveKey="print"
        onChange={() => {
          lendoRef.current = false
          setLendo(false)
        }}
      >
        <Tabs.TabPane tab={t('print.printTab')} key="print">
          <Card>
            <RfidListaConferenciaFiltros
              loading={carregando}
              rotuloEspecie={t('print.epithet')}
              placeholderEspecie={t('print.searchEpithet')}
              onDraftChange={() => setFiltroPendente(true)}
              onSearch={values => {
                setFiltros(values)
                setFiltroPendente(false)
                void carregar(values, 1, limite)
              }}
            />
            {filtroPendente && <Alert type="warning" showIcon message={t('print.applyFilters')} style={{ marginBottom: 16 }} />}
            <Alert type="info" showIcon message={t('print.filteredCount', { total })} style={{ marginBottom: 16 }} />
            <Table
              rowKey="id"
              dataSource={fotos}
              loading={carregando}
              pagination={{
                current: pagina, pageSize: limite, total, showSizeChanger: true
              }}
              onChange={p => { void carregar(filtros, p.current || 1, p.pageSize || 20) }}
              columns={[
                {
                  title: t('conferenceLists.photo'), key: 'foto', render: (_: unknown, item: FotoPendente) => <Image src={fotoUrl(item)} width={72} />
                },
                { title: t('conference.tombo'), dataIndex: 'tombo_hcf' },
                { title: t('conference.barcode'), dataIndex: 'codigo_barra' },
                { title: t('conference.genus'), dataIndex: 'genero' },
                { title: t('print.scientificName'), dataIndex: 'nome_cientifico' },
                { title: t('print.collector'), dataIndex: 'coletor_principal' }
              ]}
            />
            <Space>
              <Button icon={<ReloadOutlined />} onClick={() => { void carregar(filtros, pagina, limite) }}>{t('common.update')}</Button>
              <Button type="primary" icon={<PrinterOutlined />} loading={imprimindo} disabled={!total || filtroPendente || carregando} onClick={confirmarImpressao}>{t('print.send')}</Button>
            </Space>
          </Card>
        </Tabs.TabPane>
        <Tabs.TabPane tab={t('print.validationTab')} key="validation">
          <RfidConnectionPanel />
          <Card style={{ marginTop: 16 }}>
            <Space style={{ marginBottom: 16 }}>
              <Button type={lendo ? 'default' : 'primary'} icon={lendo ? <StopOutlined /> : <PlayCircleOutlined />} onClick={alternarLeitura}>
                {lendo ? t('print.stopReading') : t('print.startReading')}
              </Button>
              <Button
                onClick={() => {
                  setLeituras([])
                  processadosRef.current.clear()
                }}
                disabled={lendo}
              >
                {t('common.clear')}
              </Button>
            </Space>
            <Table
              rowKey="tid"
              dataSource={leituras}
              pagination={{ pageSize: 20 }}
              columns={[
                { title: 'TID', dataIndex: 'tid' },
                { title: 'EPC', dataIndex: 'epc' },
                { title: t('conference.tombo'), dataIndex: 'tombo_hcf' },
                { title: t('conference.barcode'), dataIndex: 'codigo_barra' },
                {
                  title: t('conference.status'), dataIndex: 'status', render: (status: string) => <Tag color={status === 'CONCLUIDO' ? 'green' : status === 'REPETIDA' ? 'blue' : status === 'VALIDANDO' ? 'default' : 'red'}>{t(`print.status.${status}`)}</Tag>
                },
                { title: t('print.detail'), dataIndex: 'mensagem' }
              ]}
            />
          </Card>
        </Tabs.TabPane>
      </Tabs>
    </div>
  )
}

export default RfidImpressao
