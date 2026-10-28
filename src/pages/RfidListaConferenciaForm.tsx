import React, {
  useCallback, useEffect, useState
} from 'react'

import {
  Button, Card, Col, Divider, Form, Input, Modal, notification, Row, Space
} from 'antd'
import axios from 'axios'
import { useTranslation } from 'react-i18next'

import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons'

import RfidListaConferenciaFiltros from '../components/rfid-conferencia/RfidListaConferenciaFiltros'
import RfidListaConferenciaTabela from '../components/rfid-conferencia/RfidListaConferenciaTabela'
import { FiltrosRfids, RfidVinculo } from '../components/rfid-conferencia/types'
import { RouterProps, withRouter } from '../libraries/router/withRouter'

interface ListaConferencia {
  id: number
  nome: string
  descricao?: string | null
}

interface RfidResponse {
  dados: RfidVinculo[]
  meta: {
    total: number
    pagina: number
    limite: number
  }
}

interface RfidsListaResponse {
  dados: RfidVinculo[]
  meta: {
    total: number
    pagina: number
    limite: number
  }
}

interface BulkLinksResponse {
  encontrados?: number
  adicionados?: number
  removidos?: number
}

const normalizarFiltros = (filtros: FiltrosRfids): FiltrosRfids => ({
  ...(filtros.tombo_hcf?.trim() ? { tombo_hcf: filtros.tombo_hcf.trim() } : {}),
  ...(filtros.familia_id?.length ? { familia_id: filtros.familia_id } : {}),
  ...(filtros.genero_id?.length ? { genero_id: filtros.genero_id } : {}),
  ...(filtros.especie_id?.length ? { especie_id: filtros.especie_id } : {})
})

const RfidListaConferenciaForm: React.FC<RouterProps> = ({ history, match }) => {
  const [form] = Form.useForm()
  const { t } = useTranslation('rfid')
  const id = match.params.id
  const isNovo = !id

  const [rfids, setRfids] = useState<RfidVinculo[]>([])
  const [filtrosAplicados, setFiltrosAplicados] = useState<FiltrosRfids>({})
  const [filtrosPendentes, setFiltrosPendentes] = useState(false)
  const [pesquisaCarregada, setPesquisaCarregada] = useState(false)
  const [rfidsSelecionadosPagina, setRfidsSelecionadosPagina] = useState<React.Key[]>([])
  const [rfidsVinculados, setRfidsVinculados] = useState<RfidVinculo[]>([])
  const [loading, setLoading] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [paginacao, setPaginacao] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  })
  const [paginacaoVinculados, setPaginacaoVinculados] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  })

  const notificacao = (type: 'success' | 'warning' | 'error' | 'info', titulo: string, descricao: string) => {
    notification[type]({
      message: titulo,
      description: descricao,
      placement: 'topRight'
    })
  }

  const requisitaRfids = useCallback(async (pagina = 1, limite = 20, filtros: FiltrosRfids = {}) => {
    setLoading(true)

    try {
      const response = await axios.get<RfidResponse>('/rfids', {
        params: {
          pagina,
          limite,
          ...filtros,
          status: 'CONCLUIDO',
          excluir_lista_conferencia_id: id
        },
        paramsSerializer: {
          indexes: null
        }
      })
      const { dados, meta } = response.data

      setRfids(dados)
      setPaginacao({
        current: meta.pagina,
        pageSize: meta.limite,
        total: meta.total
      })
      setPesquisaCarregada(true)
      return true
    } catch (error) {
      notificacao('error', t('common.error'), t('conferenceLists.rfidsFetchFailure'))
      return false
    } finally {
      setLoading(false)
    }
  }, [id, t])

  const carregarLista = useCallback(async () => {
    if (isNovo || !id) return

    setLoading(true)

    try {
      const [listaResponse, rfidsResponse] = await Promise.all([
        axios.get<ListaConferencia>(`/rfids/listas_conferencias/${id}`),
        axios.get<RfidsListaResponse>(`/rfids/listas_conferencias/${id}/rfids`, {
          params: {
            pagina: 1,
            limite: 20
          }
        })
      ])

      form.setFieldsValue({
        nome: listaResponse.data.nome,
        descricao: listaResponse.data.descricao
      })
      setRfidsVinculados(rfidsResponse.data.dados)
      setPaginacaoVinculados({
        current: rfidsResponse.data.meta.pagina,
        pageSize: rfidsResponse.data.meta.limite,
        total: rfidsResponse.data.meta.total
      })
    } catch (error) {
      notificacao('error', t('common.error'), t('conferenceLists.listFetchFailure'))
    } finally {
      setLoading(false)
    }
  }, [
    form,
    id,
    isNovo,
    t
  ])

  const requisitaRfidsVinculados = useCallback(async (pagina = 1, limite = 20) => {
    if (isNovo || !id) return

    try {
      let response = await axios.get<RfidsListaResponse>(`/rfids/listas_conferencias/${id}/rfids`, {
        params: { pagina, limite }
      })

      const ultimaPagina = Math.max(1, Math.ceil(response.data.meta.total / limite))
      if (pagina > ultimaPagina) {
        response = await axios.get<RfidsListaResponse>(`/rfids/listas_conferencias/${id}/rfids`, {
          params: { pagina: ultimaPagina, limite }
        })
      }

      setRfidsVinculados(response.data.dados)
      setPaginacaoVinculados({
        current: response.data.meta.pagina,
        pageSize: response.data.meta.limite,
        total: response.data.meta.total
      })
    } catch (error) {
      notificacao('error', t('common.error'), t('conferenceLists.linksFetchFailure'))
    }
  }, [
    id,
    isNovo,
    t
  ])

  useEffect(() => {
    void carregarLista()
    if (!isNovo) void requisitaRfids(1, 20)
  }, [
    carregarLista,
    isNovo,
    requisitaRfids
  ])

  const pesquisarRfids = async (filtros: FiltrosRfids) => {
    const filtrosNormalizados = normalizarFiltros(filtros)
    const sucesso = await requisitaRfids(1, paginacao.pageSize, filtrosNormalizados)
    if (sucesso) {
      setFiltrosAplicados(filtrosNormalizados)
      setFiltrosPendentes(false)
      setRfidsSelecionadosPagina([])
    }
  }

  const recarregarVinculos = async () => {
    await requisitaRfidsVinculados(paginacaoVinculados.current, paginacaoVinculados.pageSize)
  }

  const recarregarResultados = async () => {
    setRfidsSelecionadosPagina([])
    await requisitaRfids(1, paginacao.pageSize, filtrosAplicados)
  }

  const adicionarTodosDoFiltro = async () => {
    if (isNovo || !id || filtrosPendentes || !pesquisaCarregada) return

    setLoading(true)
    try {
      const response = await axios.post<BulkLinksResponse>(`/rfids/listas_conferencias/${id}/rfids`, filtrosAplicados)
      await recarregarVinculos()
      await recarregarResultados()
      notificacao('success', t('conferenceLists.bulkActionTitle'), t('conferenceLists.addedFiltered', {
        adicionados: response.data.adicionados || 0
      }))
    } catch (error) {
      notificacao('error', t('common.error'), t('conferenceLists.linksUpdateFailure'))
    } finally {
      setLoading(false)
    }
  }

  const adicionarSelecionados = async () => {
    if (isNovo || !id || rfidsSelecionadosPagina.length === 0) return

    setLoading(true)
    try {
      const response = await axios.post<BulkLinksResponse>(`/rfids/listas_conferencias/${id}/rfids`, {
        rfid_ids: rfidsSelecionadosPagina.map(Number)
      })
      await recarregarVinculos()
      await recarregarResultados()
      notificacao('success', t('conferenceLists.bulkActionTitle'), t('conferenceLists.addedSelected', {
        adicionados: response.data.adicionados || 0
      }))
    } catch (error) {
      notificacao('error', t('common.error'), t('conferenceLists.linksUpdateFailure'))
    } finally {
      setLoading(false)
    }
  }

  const removerTodosDoFiltro = async () => {
    if (isNovo || !id || filtrosPendentes || !pesquisaCarregada || Object.keys(filtrosAplicados).length === 0) return

    setLoading(true)
    try {
      const response = await axios.delete<BulkLinksResponse>(`/rfids/listas_conferencias/${id}/rfids`, {
        data: filtrosAplicados
      })
      await recarregarVinculos()
      await recarregarResultados()
      notificacao('success', t('conferenceLists.bulkActionTitle'), t('conferenceLists.removedFiltered', {
        removidos: response.data.removidos || 0
      }))
    } catch (error) {
      notificacao('error', t('common.error'), t('conferenceLists.linksUpdateFailure'))
    } finally {
      setLoading(false)
    }
  }

  const limparVinculos = async () => {
    if (isNovo || !id) return

    setLoading(true)
    try {
      const response = await axios.delete<BulkLinksResponse>(`/rfids/listas_conferencias/${id}/rfids/todos`)
      await requisitaRfidsVinculados(1, paginacaoVinculados.pageSize)
      await recarregarResultados()
      notificacao('success', t('conferenceLists.bulkActionTitle'), t('conferenceLists.removedAll', {
        removidos: response.data.removidos || 0
      }))
    } catch (error) {
      notificacao('error', t('common.error'), t('conferenceLists.linksUpdateFailure'))
    } finally {
      setLoading(false)
    }
  }

  const confirmarLimpezaVinculos = () => {
    Modal.confirm({
      title: t('conferenceLists.clearLinksQuestion'),
      content: t('conferenceLists.clearLinksDescription'),
      okText: t('conferenceLists.clearLinks'),
      okType: 'danger',
      cancelText: t('common.cancel'),
      onOk: limparVinculos
    })
  }

  const salvar = async (values: { nome: string; descricao?: string }) => {
    setSalvando(true)

    try {
      const payload = {
        nome: values.nome,
        descricao: values.descricao
      }

      if (isNovo) {
        const response = await axios.post<ListaConferencia>('/rfids/listas_conferencias', payload)
        notificacao('success', t('conferenceLists.savedTitle'), t('conferenceLists.savedDescription'))
        history.push(`/rfid-listas-conferencia/${response.data.id}`)
      } else {
        await axios.put(`/rfids/listas_conferencias/${id}`, payload)
        notificacao('success', t('conferenceLists.savedTitle'), t('conferenceLists.savedDescription'))
      }
    } catch (error) {
      notificacao('error', t('common.error'), t('conferenceLists.saveFailure'))
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div style={{ padding: '24px' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: '20px' }}>
        <Col>
          <h2 style={{ fontWeight: 200, margin: 0 }}>
            {isNovo ? t('conferenceLists.newTitle') : t('conferenceLists.editTitle')}
          </h2>
        </Col>
        <Col>
          <Button icon={<ArrowLeftOutlined />} onClick={() => history.push('/rfid-listas-conferencia')}>
            {t('conferenceLists.backToLists')}
          </Button>
        </Col>
      </Row>

      <Divider dashed />

      <Form id="lista-conferencia-form" form={form} layout="vertical" onFinish={salvar}>
        <Card title={t('conferenceLists.listData')} bordered={false} style={{ marginBottom: 24 }}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="nome"
                label={t('conferenceLists.name')}
                rules={[{ required: true, message: t('conferenceLists.nameRequired') }]}
              >
                <Input placeholder={t('conferenceLists.namePlaceholder')} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="descricao" label={t('conferenceLists.description')}>
                <Input placeholder={t('conferenceLists.descriptionPlaceholder')} />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Form>

      {!isNovo && (
        <>
          <Card title={t('conferenceLists.filtersTitle')} bordered={false} style={{ marginBottom: 24 }}>
            <RfidListaConferenciaFiltros
              loading={loading}
              onSearch={pesquisarRfids}
              onDraftChange={() => setFiltrosPendentes(true)}
              acoes={(
                <>
                  <Col>
                    <Button onClick={() => void adicionarSelecionados()} disabled={rfidsSelecionadosPagina.length === 0} loading={loading}>
                      {t('conferenceLists.addSelected')}
                    </Button>
                  </Col>
                  <Col>
                    <Button onClick={() => void adicionarTodosDoFiltro()} disabled={filtrosPendentes || !pesquisaCarregada || paginacao.total === 0} loading={loading}>
                      {t('conferenceLists.addAllFiltered')}
                    </Button>
                  </Col>
                  <Col>
                    <Button danger onClick={() => void removerTodosDoFiltro()} disabled={filtrosPendentes || !pesquisaCarregada || Object.keys(filtrosAplicados).length === 0} loading={loading}>
                      {t('conferenceLists.removeAllFiltered')}
                    </Button>
                  </Col>
                </>
              )}
            />
            {filtrosPendentes && <div>{t('conferenceLists.searchBeforeBulkAction')}</div>}
          </Card>
          <RfidListaConferenciaTabela
            titulo={t('conferenceLists.availableRfids')}
            dados={rfids}
            paginacao={paginacao}
            loading={loading}
            contador={t('conferenceLists.filteredCount', { total: paginacao.total })}
            onPageChange={(pagina, limite) => {
              setRfidsSelecionadosPagina([])
              void requisitaRfids(pagina, limite, filtrosAplicados)
            }}
            selecionados={rfidsSelecionadosPagina}
            onSelectionChange={setRfidsSelecionadosPagina}
          />
        </>
      )}

      {!isNovo && (
        <RfidListaConferenciaTabela
          titulo={t('conferenceLists.linkedRfids')}
          dados={rfidsVinculados}
          paginacao={paginacaoVinculados}
          loading={loading}
          contador={t('conferenceLists.selectedCount', { total: paginacaoVinculados.total })}
          onPageChange={(pagina, limite) => void requisitaRfidsVinculados(pagina, limite)}
          style={{ marginTop: 24 }}
          acoes={(
            <Button danger size="small" onClick={confirmarLimpezaVinculos} loading={loading} disabled={paginacaoVinculados.total === 0}>
              {t('conferenceLists.clearLinks')}
            </Button>
          )}
        />
      )}

      <Row justify="end" style={{ marginTop: 24 }}>
        <Space>
          <Button onClick={() => history.push('/rfid-listas-conferencia')}>{t('common.cancel')}</Button>
          <Button type="primary" htmlType="submit" form="lista-conferencia-form" icon={<SaveOutlined />} loading={salvando}>
            {t('conferenceLists.saveList')}
          </Button>
        </Space>
      </Row>
    </div>
  )
}

export default withRouter(RfidListaConferenciaForm)
