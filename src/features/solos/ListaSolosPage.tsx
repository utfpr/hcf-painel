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
import { useTranslation } from 'react-i18next'

import { TipoUsuario } from '@/@types/components'
import SimpleTableComponent from '@/components/SimpleTableComponent'
import TotalRecordFound from '@/components/TotalRecordsFound'
import { useAuth } from '@/contexts/Auth/useAuth'
import { EditOutlined, PlusOutlined } from '@ant-design/icons'

import type { SoloListItem } from './types'
import { useListaSolosPage } from './useListaSolosPage'

export default function ListaSolosPage() {
  const { t } = useTranslation('listaSolos')
  const list = useListaSolosPage()
  const { user, can } = useAuth()
  const [searchName, setSearchName] = useState('')
  const [selectedSolo, setSelectedSolo] = useState<SoloListItem>()
  const canViewActions = user?.tipo_usuario_id === TipoUsuario.Curador
      && can('read', 'Solo')

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

  const rows = list.solos.map(solo => ({
    key: solo.id,
    id: solo.id,
    nome: solo.nome,
    acao: canViewActions
      ? (
        <a
          aria-label={t('abrirDetalhes', { nome: solo.nome })}
          onClick={() => setSelectedSolo(solo)}
        >
          <EditOutlined style={{ color: '#FFCC00' }} />
        </a>
      )
      : undefined
  }))

  return (
    <div>
      <Row gutter={24} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={14} md={18} lg={20} xl={20}>
          <h2 style={{ fontWeight: 200 }}>{t('titulo')}</h2>
        </Col>
        {canViewActions && (
          <Col xs={24} sm={10} md={6} lg={4} xl={4}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              disabled
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
            <label htmlFor="solos-search-name">{t('campoNome')}</label>
          </Col>
        </Row>
        <Row gutter={8}>
          <Col span={24}>
            <Input
              id="solos-search-name"
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

      <Modal
        title={t('detalhesTitulo')}
        visible={Boolean(selectedSolo)}
        onCancel={() => setSelectedSolo(undefined)}
        footer={[
          <Button key="close" onClick={() => setSelectedSolo(undefined)}>
            {t('fechar')}
          </Button>
        ]}
      >
        <p>
          <strong>
            {t('campoId')}
            :
          </strong>
          {' '}
          {selectedSolo?.id}
        </p>
        <p>
          <strong>
            {t('campoNome')}
            :
          </strong>
          {' '}
          {selectedSolo?.nome}
        </p>
      </Modal>
    </div>
  )
}
