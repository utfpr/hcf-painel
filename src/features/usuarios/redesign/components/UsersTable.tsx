import {
  Button, Dropdown, Flex, Table, Typography, theme, type TableProps
} from 'antd6'
import { useTranslation } from 'react-i18next'

import { EllipsisOutlined } from '@ant-design/icons'

import type { UsuarioRow } from '../types'

interface UsersTableProps {
  rows: UsuarioRow[]
  loading: boolean
  total: number
  page: number
  pageSize: number
  isMobile: boolean
  visibleKeys: string[]
  onPageChange: (page: number, pageSize?: number) => void
  onEdit: (id: number) => void
  onDelete: (row: UsuarioRow) => void
}

function isInteractiveTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return Boolean(target.closest('a, button, .ant6-dropdown, .ant6-dropdown-trigger'))
}

export function UsersTable({
  rows,
  loading,
  total,
  page,
  pageSize,
  isMobile,
  visibleKeys,
  onPageChange,
  onEdit,
  onDelete
}: UsersTableProps) {
  const { t } = useTranslation()
  const { token } = theme.useToken()
  const visible = new Set(visibleKeys)

  const roleLabel = (tipo: string) => {
    const normalized = tipo.toLowerCase()
    if (normalized.includes('curador') || normalized.includes('curator')) {
      return t('users:roles.curator')
    }
    if (normalized.includes('operador') || normalized.includes('operator')) {
      return t('users:roles.operator')
    }
    if (normalized.includes('identificador') || normalized.includes('identifier')) {
      return t('users:roles.identifier')
    }
    return tipo
  }

  const actionColumn: TableProps<UsuarioRow>['columns'] = [
    {
      title: t('users:columns.actions'),
      key: 'acao',
      width: 56,
      align: 'center',
      render: (_, row) => (
        <Dropdown
          trigger={['click']}
          menu={{
            items: [
              {
                key: 'edit',
                label: t('users:actions.edit'),
                onClick: () => onEdit(row.key)
              },
              {
                key: 'delete',
                danger: true,
                label: t('users:actions.delete'),
                onClick: () => onDelete(row)
              }
            ]
          }}
        >
          <Button
            type="text"
            size="small"
            aria-label={t('users:actions.menu')}
            icon={<EllipsisOutlined />}
            onClick={event => event.stopPropagation()}
          />
        </Dropdown>
      )
    }
  ]

  const desktopColumns: TableProps<UsuarioRow>['columns'] = [
    visible.has('nome')
      ? {
        title: t('users:columns.name'),
        dataIndex: 'nome',
        key: 'nome',
        sorter: (a: UsuarioRow, b: UsuarioRow) => a.nome.localeCompare(b.nome),
        render: (nome: string) => <Typography.Text>{nome}</Typography.Text>
      }
      : null,
    visible.has('tipo')
      ? {
        title: t('users:columns.type'),
        dataIndex: 'tipo',
        key: 'tipo',
        width: 140,
        sorter: (a: UsuarioRow, b: UsuarioRow) => a.tipo.localeCompare(b.tipo),
        render: (tipo: string) => roleLabel(tipo)
      }
      : null,
    visible.has('email')
      ? {
        title: t('users:columns.email'),
        dataIndex: 'email',
        key: 'email',
        sorter: (a: UsuarioRow, b: UsuarioRow) => a.email.localeCompare(b.email),
        render: (email: string) => (
          <Typography.Link
            href={`mailto:${email}`}
            onClick={event => event.stopPropagation()}
          >
            {email}
          </Typography.Link>
        )
      }
      : null,
    visible.has('telefone')
      ? {
        title: t('users:columns.phone'),
        dataIndex: 'telefone',
        key: 'telefone',
        width: 180
      }
      : null,
    visible.has('dataCriacao')
      ? {
        title: t('users:columns.creationDate'),
        dataIndex: 'dataCriacao',
        key: 'dataCriacao',
        width: 180,
        sorter: (a: UsuarioRow, b: UsuarioRow) => a.dataCriacao.localeCompare(b.dataCriacao)
      }
      : null,
    ...actionColumn
  ].filter(Boolean) as TableProps<UsuarioRow>['columns']

  const mobileColumns: TableProps<UsuarioRow>['columns'] = [
    {
      title: t('users:columns.name'),
      key: 'usuario',
      render: (_, row) => (
        <Flex vertical>
          <Typography.Text>{row.nome}</Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 13 }}>
            {row.email}
          </Typography.Text>
        </Flex>
      )
    },
    {
      title: t('users:columns.type'),
      dataIndex: 'tipo',
      key: 'tipo',
      width: 120,
      render: (tipo: string) => roleLabel(tipo)
    },
    ...actionColumn
  ]

  return (
    <div
      style={{
        background: token.colorBgContainer,
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: 8,
        overflow: 'hidden'
      }}
    >
      <Table<UsuarioRow>
        size="middle"
        rowKey="key"
        columns={isMobile ? mobileColumns : desktopColumns}
        dataSource={rows}
        loading={loading}
        pagination={{
          total,
          current: page,
          pageSize,
          showSizeChanger: true,
          pageSizeOptions: [
            '20',
            '50',
            '100'
          ],
          showTotal: (value, range) => t('users:pagination.total', {
            from: range[0],
            to: range[1],
            total: value
          }),
          locale: {
            items_per_page: `/ ${t('simpleTableComponent:pagina')}`,
            jump_to: t('simpleTableComponent:irPara'),
            jump_to_confirm: t('simpleTableComponent:irParaConfirmar'),
            page: t('simpleTableComponent:pagina'),
            prev_page: t('simpleTableComponent:paginaAnterior'),
            next_page: t('simpleTableComponent:proximaPagina'),
            prev_5: t('simpleTableComponent:voltar5Paginas'),
            next_5: t('simpleTableComponent:avancar5Paginas'),
            prev_3: t('simpleTableComponent:voltar3Paginas'),
            next_3: t('simpleTableComponent:avancar3Paginas')
          }
        }}
        locale={{
          triggerDesc: t('simpleTableComponent:ordenacaoDecrescente'),
          triggerAsc: t('simpleTableComponent:ordenacaoCrescente'),
          cancelSort: t('simpleTableComponent:cancelarOrdenacao')
        }}
        onChange={pagination => {
          onPageChange(pagination.current ?? 1, pagination.pageSize)
        }}
        onRow={row => ({
          style: {
            cursor: 'pointer',
            transition: 'background-color 120ms ease'
          },
          tabIndex: 0,
          onClick: event => {
            if (isInteractiveTarget(event.target)) return
            onEdit(row.key)
          },
          onKeyDown: event => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              onEdit(row.key)
            }
          }
        })}
      />
    </div>
  )
}
