import { useState } from 'react'

import {
  App, Button, Empty, Flex, Grid, Result
} from 'antd6'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { DataList } from '@/components/list/DataList'
import { Page } from '@/components/Page/Page'
import { Can } from '@/contexts/Auth/Can'
import { PlusOutlined } from '@ant-design/icons'

import { AddUserDrawer } from './components/AddUserDrawer'
import { UsersToolbar } from './components/UsersToolbar'
import { buildUsuarioColumns } from './components/usuarioColumns'
import { useListaUsuariosPage } from './hooks/useListaUsuariosPage'
import type { UsuarioQuery } from './hooks/useListaUsuariosPage'
import type { UsuarioRow } from './types'

export default function ListaUsuariosPage() {
  const { t } = useTranslation('listaUsuariosPage')
  const navigate = useNavigate()
  const { modal, notification } = App.useApp()
  const screens = Grid.useBreakpoint()
  const isMobile = screens.md === false
  const pageState = useListaUsuariosPage()
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
          const deleted = await pageState.remove(row.key)
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
      <DataList<UsuarioQuery, UsuarioRow>
        storageKey="hcf.users.columns"
        defaults={{
          q: '',
          role: '',
          sort: '',
          order: ''
        }}
        fetch={({
          query, page, pageSize
        }) => pageState.fetchUsuarios(query, page, pageSize)}
        rowKey="key"
        onRowClick={row => {
          void navigate(`/usuarios/${row.key}`)
        }}
        error={({ refresh }) => (
          <Result
            status="error"
            title={t('error.title')}
            subTitle={t('error.description')}
            extra={(
              <Button type="primary" onClick={refresh}>
                {t('error.retry')}
              </Button>
            )}
          />
        )}
        emptyText={({ hasActiveFilters, clearQuery }) => (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={(
              <Flex vertical gap={4} align="center">
                <strong>
                  {hasActiveFilters ? t('empty.filteredTitle') : t('empty.title')}
                </strong>
                <span>
                  {hasActiveFilters
                    ? t('empty.filteredDescription')
                    : t('empty.description')}
                </span>
              </Flex>
            )}
          >
            {hasActiveFilters && (
              <Button onClick={() => clearQuery(['q', 'role'])}>
                {t('empty.clearFilters')}
              </Button>
            )}
            {!hasActiveFilters && (
              <Can action="create" resource="Usuario">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setDrawerOpen(true)}
                >
                  {t('actions.add')}
                </Button>
              </Can>
            )}
          </Empty>
        )}
        columns={({ isMobile: mobile }) => buildUsuarioColumns({
          t,
          isMobile: mobile,
          onDelete: confirmDelete
        })}
        filters={({ query, setQuery }) => (
          <UsersToolbar
            query={query.q}
            role={query.role}
            onSearch={q => setQuery({ q })}
            onRoleChange={role => setQuery({ role })}
          />
        )}
      />

      <AddUserDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onCreate={async payload => {
          const created = await pageState.create(payload)
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
