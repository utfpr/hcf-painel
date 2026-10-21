import { useEffect, useState } from 'react'

import {
  Button,
  Card,
  Col,
  Divider,
  Input,
  Modal,
  notification,
  Row
} from 'antd'
import axios from 'axios'
import { useTranslation } from 'react-i18next'

import ModalCadastroComponent from '@/components/ModalCadastroComponent'
import SimpleTableComponent from '@/components/SimpleTableComponent'
import TotalRecordFound from '@/components/TotalRecordsFound'
import { useAuth } from '@/contexts/Auth/useAuth'
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined
} from '@ant-design/icons'

import type { RelevoListItem } from './types'
import { useListaRelevosPage } from './useListaRelevosPage'

export default function ListaRelevosPage() {
  const { t } = useTranslation('listaRelevos')
  const list = useListaRelevosPage()
  const { can } = useAuth()
  const [searchName, setSearchName] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [editingRelevoId, setEditingRelevoId] = useState<number | string>()
  const [relevoName, setRelevoName] = useState('')
  const canCreate = can('create', 'Relevo')
  const canUpdate = can('update', 'Relevo')
  const canDelete = can('delete', 'Relevo')
  const canViewActions = canUpdate || canDelete
  const modalTitle = editingRelevoId === undefined
    ? t('common:cadastrar')
    : t('common:atualizar')

  useEffect(() => {
    if (list.error) {
      notification.error({
        message: t('erro'),
        description: t('erroBuscar')
      })
    }
  }, [list.error, t])

  const search = () => list.search(searchName)
  const clear = () => {
    setSearchName('')
    list.search('')
  }

  const closeModal = () => setModalVisible(false)

  const showMutationError = (error: unknown) => {
    const status = axios.isAxiosError(error) ? error.response?.status : undefined
    const description = status === 400
      ? t('erroRequisicao')
      : status === 404
        ? t('erroNaoEncontrado')
        : status === 409
          ? t('erroConflito')
          : t('erroOperacao')

    notification.error({
      message: t('erro'),
      description
    })
  }

  const openCreateModal = () => {
    setEditingRelevoId(undefined)
    setRelevoName('')
    setModalVisible(true)
  }

  const openUpdateModal = (relevo: RelevoListItem) => {
    setEditingRelevoId(relevo.id)
    setRelevoName(relevo.nome)
    setModalVisible(true)
  }

  const save = async () => {
    const nome = relevoName.trim()
    if (!nome) {
      notification.warning({
        message: t('aviso'),
        description: t('nomeObrigatorio')
      })
      return
    }

    try {
      if (editingRelevoId === undefined) {
        const response = await list.create(nome)
        if (response?.status === 201) {
          notification.success({ message: t('cadastroSucesso') })
          closeModal()
        }
        return
      }

      const response = await list.update(editingRelevoId, nome)
      if (response?.status === 200) {
        notification.success({ message: t('atualizacaoSucesso') })
        closeModal()
      }
    } catch (error) {
      showMutationError(error)
    }
  }

  const confirmDelete = (relevo: RelevoListItem) => {
    Modal.confirm({
      title: t('confirmacaoExcluir'),
      content: t('descricaoExcluir', { nome: relevo.nome }),
      okText: t('common:sim'),
      okType: 'danger',
      cancelText: t('common:nao'),
      onOk: async () => {
        try {
          const response = await list.remove(relevo.id)
          if (response?.status === 204) {
            notification.success({ message: t('exclusaoSucesso') })
          }
        } catch (error) {
          showMutationError(error)
        }
      }
    })
  }

  const columns = [
    {
      title: t('colunaId'),
      key: 'id',
      sorter: true,
      width: 100
    },
    {
      title: t('colunaNome'),
      key: 'nome',
      sorter: true
    },
    ...(canViewActions
      ? [
        {
          title: t('colunaAcao'),
          key: 'acao',
          width: 100
        }
      ]
      : [])
  ]

  const rows = list.relevos.map(relevo => ({
    key: relevo.id,
    id: relevo.id,
    nome: relevo.nome,
    acao: canViewActions
      ? (
        <span>
          {canUpdate && (
            <>
              <a
                aria-label={t('renomear', { nome: relevo.nome })}
                onClick={() => openUpdateModal(relevo)}
              >
                <EditOutlined style={{ color: '#FFCC00' }} />
              </a>
              {canDelete && <Divider type="vertical" />}
            </>
          )}
          {canDelete && (
            <a
              aria-label={t('excluir', { nome: relevo.nome })}
              onClick={() => confirmDelete(relevo)}
            >
              <DeleteOutlined style={{ color: '#e30613' }} />
            </a>
          )}
        </span>
      )
      : undefined
  }))

  return (
    <div>
      <Row gutter={24} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={14} md={18} lg={20} xl={20}>
          <h2 style={{ fontWeight: 200 }}>{t('titulo')}</h2>
        </Col>
        {canCreate && (
          <Col xs={24} sm={10} md={6} lg={4} xl={4}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreateModal}
              style={{
                backgroundColor: '#5CB85C', borderColor: '#5CB85C', width: '100%'
              }}
            >
              {t('adicionar')}
            </Button>
          </Col>
        )}
      </Row>

      <Divider dashed />
      <Card title={t('buscarTitulo')}>
        <Row gutter={8}>
          <Col span={24}>
            <label htmlFor="relevos-search-name">{t('campoNome')}</label>
          </Col>
        </Row>
        <Row gutter={8}>
          <Col span={24}>
            <Input
              id="relevos-search-name"
              value={searchName}
              placeholder={t('placeholderNome')}
              onChange={event => setSearchName(event.target.value)}
              onPressEnter={search}
            />
          </Col>
        </Row>
        <Row style={{ marginTop: 32 }}>
          <Col span={24}>
            <Row align="middle" justify="end" gutter={16}>
              <Col xs={24} sm={8} md={12} lg={16} xl={16}>
                <TotalRecordFound total={list.metadados.total} />
              </Col>
              <Col xs={24} sm={8} md={6} lg={4} xl={4}>
                <Button block onClick={clear}>{t('limpar')}</Button>
              </Col>
              <Col xs={24} sm={8} md={6} lg={4} xl={4}>
                <Button block type="primary" onClick={search}>{t('pesquisar')}</Button>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>
      <Divider dashed />

      <SimpleTableComponent
        columns={columns}
        data={rows}
        metadados={list.metadados}
        loading={list.loading}
        changePage={list.changePage}
      />
      <Divider dashed />

      <ModalCadastroComponent
        title={modalTitle}
        visibleModal={modalVisible}
        loadingModal={list.creating || list.updating}
        onCancel={closeModal}
        onOk={save}
      >
        <Row gutter={8}>
          <Col span={24}>
            <label htmlFor="relevo-name">{t('campoNome')}</label>
          </Col>
        </Row>
        <Row gutter={8}>
          <Col span={24}>
            <Input
              id="relevo-name"
              value={relevoName}
              onChange={event => setRelevoName(event.target.value)}
              onPressEnter={save}
            />
          </Col>
        </Row>
      </ModalCadastroComponent>
    </div>
  )
}
