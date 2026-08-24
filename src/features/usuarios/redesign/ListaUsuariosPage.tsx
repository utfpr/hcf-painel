import { useState } from 'react'

import {
  App, Button, Empty, Flex, Grid, Result
} from 'antd6'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { Page } from '@/components/Page/Page'
import { Can } from '@/contexts/Auth/Can'
import { PlusOutlined } from '@ant-design/icons'

import { AddUserDrawer } from './components/AddUserDrawer'
import { UsersTable } from './components/UsersTable'
import { UsersToolbar } from './components/UsersToolbar'
import { useColumnVisibility } from './hooks/useColumnVisibility'
import { useListaUsuariosPage } from './hooks/useListaUsuariosPage'
import type { UsuarioRow } from './types'

export default function ListaUsuariosPage() {
  const { t } = useTranslation('listaUsuariosPage')
  const navigate = useNavigate()
  const { modal, notification } = App.useApp()
  const screens = Grid.useBreakpoint()
  const isMobile = screens.md === false
  const list = useListaUsuariosPage()
  const columns = useColumnVisibility()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const confirmDelete = (row: UsuarioRow) => {
    modal.confirm({
      title: t('delete.title'),
      content: t('delete.description', { name: row.nome }),
      okText: t('actions.delete'),
      okType: 'danger',
      cancelText: t('common:cancelar'),
      onOk: async () => {
        try {
          const deleted = await list.remove(row.key)
          if (deleted) {
            notification.success({
              message: t('common:tituloSucesso'),
              description: t('delete.success')
            })
          }
        } catch (error) {
          console.error(error)
          notification.error({
            message: t('delete.errorTitle'),
            description: t('delete.error')
          })
        }
      }
    })
  }

  const total = list.metadados.total ?? 0
  const showError = Boolean(list.error) && list.usuarios.length === 0 && !list.loading
  const showEmpty = !list.loading && !list.error && total === 0

  return (
    <Page
      title={t('title')}
      description={t('description')}
      extra={(
        <Can action="create" resource="Usuario">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setDrawerOpen(true)}
          >
            {isMobile ? t('actions.addShort') : t('actions.add')}
          </Button>
        </Can>
      )}
    >
      <UsersToolbar
        query={list.query}
        role={list.role}
        onSearch={list.setQuery}
        onRoleChange={list.setRole}
        visibleKeys={columns.visibleKeys}
        onColumnsChange={columns.setVisibleKeys}
        onColumnsReset={columns.reset}
      />

      {showError && (
        <Result
          status="error"
          title={t('error.title')}
          subTitle={t('error.description')}
          extra={(
            <Button type="primary" onClick={() => void list.refresh()}>
              {t('error.retry')}
            </Button>
          )}
        />
      )}

      {showEmpty && (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={(
            <Flex vertical gap={4} align="center">
              <strong>
                {list.hasActiveFilters ? t('empty.filteredTitle') : t('empty.title')}
              </strong>
              <span>
                {list.hasActiveFilters
                  ? t('empty.filteredDescription')
                  : t('empty.description')}
              </span>
            </Flex>
          )}
        >
          {list.hasActiveFilters && (
            <Button onClick={list.clearFilters}>
              {t('empty.clearFilters')}
            </Button>
          )}
          {!list.hasActiveFilters && (
            <Can action="create" resource="Usuario">
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setDrawerOpen(true)}>
                {t('actions.add')}
              </Button>
            </Can>
          )}
        </Empty>
      )}

      {!showError && !showEmpty && (
        <UsersTable
          rows={list.usuarios}
          loading={list.loading}
          total={total}
          page={list.pagina}
          pageSize={list.pageSize}
          isMobile={isMobile}
          visibleKeys={columns.visibleKeys}
          onPageChange={list.changePage}
          onEdit={id => {
            void navigate(`/usuarios/${id}`)
          }}
          onDelete={confirmDelete}
        />
      )}

      <AddUserDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onCreate={async payload => {
          const created = await list.create(payload)
          if (created) {
            notification.success({
              message: t('common:tituloSucesso'),
              description: t('create.success')
            })
          }
          return created
        }}
      />
    </Page>
  )
}
