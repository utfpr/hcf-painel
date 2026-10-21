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

import type { VegetacaoListItem } from './types'
import { useListaVegetacoesPage } from './useListaVegetacoesPage'

export default function ListaVegetacoesPage() {
  const { t } = useTranslation('listaVegetacoes')
  const list = useListaVegetacoesPage()
  const { can } = useAuth()
  const [searchName, setSearchName] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [editingVegetacaoId, setEditingVegetacaoId] = useState<number>()
  const [vegetacaoName, setVegetacaoName] = useState('')
  const canCreate = can('create', 'Vegetacao')
  const canUpdate = can('update', 'Vegetacao')
  const canDelete = can('delete', 'Vegetacao')
  const canViewActions = canUpdate || canDelete
  const modalTitle = editingVegetacaoId === undefined
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
    setEditingVegetacaoId(undefined)
    setVegetacaoName('')
    setModalVisible(true)
  }

  const openUpdateModal = (vegetacao: VegetacaoListItem) => {
    setEditingVegetacaoId(vegetacao.id)
    setVegetacaoName(vegetacao.nome)
    setModalVisible(true)
  }

  const save = async () => {
    const nome = vegetacaoName.trim()
    if (!nome) {
      notification.warning({
        message: t('aviso'),
        description: t('nomeObrigatorio')
      })
      return
    }

    try {
      if (editingVegetacaoId === undefined) {
        const response = await list.create(nome)
        if (response?.status === 201) {
          notification.success({ message: t('cadastroSucesso') })
          closeModal()
        }
        return
      }

      const response = await list.update(editingVegetacaoId, nome)
      if (response?.status === 200) {
        notification.success({ message: t('atualizacaoSucesso') })
        closeModal()
      }
    } catch (error) {
      showMutationError(error)
    }
  }

  const confirmDelete = (vegetacao: VegetacaoListItem) => {
    Modal.confirm({
      title: t('confirmacaoExcluir'),
      content: t('descricaoExcluir', { nome: vegetacao.nome }),
      okText: t('common:sim'),
      okType: 'danger',
      cancelText: t('common:nao'),
      onOk: async () => {
        try {
          const response = await list.remove(vegetacao.id)
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

  const rows = list.vegetacoes.map(vegetacao => ({
    key: vegetacao.id,
    id: vegetacao.id,
    nome: vegetacao.nome,
    acao: canViewActions
      ? (
        <span>
          {canUpdate && (
            <>
              <a
                aria-label={t('renomear', { nome: vegetacao.nome })}
                onClick={() => openUpdateModal(vegetacao)}
              >
                <EditOutlined style={{ color: '#FFCC00' }} />
              </a>
              {canDelete && <Divider type="vertical" />}
            </>
          )}
          {canDelete && (
            <a
              aria-label={t('excluir', { nome: vegetacao.nome })}
              onClick={() => confirmDelete(vegetacao)}
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
            <label htmlFor="vegetacoes-search-name">{t('campoNome')}</label>
          </Col>
        </Row>
        <Row gutter={8}>
          <Col span={24}>
            <Input
              id="vegetacoes-search-name"
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
            <label htmlFor="vegetacao-name">{t('campoNome')}</label>
          </Col>
        </Row>
        <Row gutter={8}>
          <Col span={24}>
            <Input
              id="vegetacao-name"
              value={vegetacaoName}
              onChange={event => setVegetacaoName(event.target.value)}
              onPressEnter={save}
            />
          </Col>
        </Row>
      </ModalCadastroComponent>
    </div>
  )
}
