import {
  Button, Dropdown, Flex, Typography
} from 'antd6'
import type { TFunction } from 'i18next'

import type { DataTableColumn } from '@/components/list/DataTable'
import { EllipsisOutlined } from '@ant-design/icons'

import type { UsuarioRow } from '../types'

function roleLabel(t: TFunction<'listaUsuariosPage'>, tipo: string): string {
  const normalized = tipo.toLowerCase()
  if (normalized.includes('curador') || normalized.includes('curator')) {
    return t('roles.curator')
  }
  if (normalized.includes('operador') || normalized.includes('operator')) {
    return t('roles.operator')
  }
  if (normalized.includes('identificador') || normalized.includes('identifier')) {
    return t('roles.identifier')
  }
  return tipo
}

export function buildUsuarioColumns(options: {
  t: TFunction<'listaUsuariosPage'>
  isMobile: boolean
  onDelete: (row: UsuarioRow) => void
}): DataTableColumn<UsuarioRow>[] {
  const {
    t, isMobile, onDelete
  } = options

  const actions: DataTableColumn<UsuarioRow> = {
    key: 'actions',
    title: t('columns.actions'),
    width: 56,
    align: 'center',
    hideable: false,
    render: row => (
      <span data-list-row-action="">
        <Dropdown
          trigger={['click']}
          menu={{
            items: [
              {
                key: 'delete',
                danger: true,
                label: t('actions.delete'),
                onClick: () => onDelete(row)
              }
            ]
          }}
        >
          <Button
            type="text"
            size="small"
            aria-label={t('actions.menu')}
            icon={<EllipsisOutlined />}
            onClick={event => event.stopPropagation()}
          />
        </Dropdown>
      </span>
    )
  }

  if (isMobile) {
    return [
      {
        key: 'usuario',
        title: t('columns.name'),
        hideable: false,
        render: row => (
          <Flex vertical>
            <Typography.Text>{row.nome}</Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 13 }}>
              {row.email}
            </Typography.Text>
          </Flex>
        )
      },
      {
        key: 'tipo',
        title: t('columns.type'),
        width: 120,
        render: row => roleLabel(t, row.tipo)
      },
      actions
    ]
  }

  return [
    {
      key: 'nome',
      title: t('columns.name'),
      hideable: false,
      sortable: true,
      render: row => <Typography.Text>{row.nome}</Typography.Text>
    },
    {
      key: 'tipo',
      title: t('columns.type'),
      width: 140,
      sortable: true,
      render: row => roleLabel(t, row.tipo)
    },
    {
      key: 'email',
      title: t('columns.email'),
      sortable: true,
      render: row => (
        <Typography.Link
          href={`mailto:${row.email}`}
          onClick={event => event.stopPropagation()}
        >
          {row.email}
        </Typography.Link>
      )
    },
    {
      key: 'telefone',
      title: t('columns.phone'),
      width: 180,
      render: row => row.telefone
    },
    {
      key: 'dataCriacao',
      title: t('columns.creationDate'),
      width: 180,
      sortable: true,
      render: row => row.dataCriacao
    },
    actions
  ]
}
