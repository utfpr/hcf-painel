import { useEffect, useState } from 'react'

import {
  Button, Flex, Grid, Input, Popover, Select
} from 'antd6'
import { useTranslation } from 'react-i18next'

import { ColumnSettings } from '@/components/list/ColumnSettings'
import { FilterOutlined } from '@ant-design/icons'

interface UsersToolbarProps {
  query: string
  role: string
  onSearch: (query: string) => void
  onRoleChange: (role: string) => void
  visibleKeys: string[]
  onColumnsChange: (keys: string[]) => void
  onColumnsReset: () => void
}

export function UsersToolbar({
  query,
  role,
  onSearch,
  onRoleChange,
  visibleKeys,
  onColumnsChange,
  onColumnsReset
}: UsersToolbarProps) {
  const { t } = useTranslation('users')
  const screens = Grid.useBreakpoint()
  const isMobile = screens.md === false
  const isNarrow = screens.sm === false
  const [draft, setDraft] = useState(query)

  useEffect(() => {
    setDraft(query)
  }, [query])

  const roleOptions = [
    { value: '1', label: t('roles.curator') },
    { value: '2', label: t('roles.operator') },
    { value: '3', label: t('roles.identifier') }
  ]

  const roleSelect = (
    <Select
      allowClear
      value={role || undefined}
      placeholder={t('filters.role')}
      options={roleOptions}
      onChange={value => onRoleChange(value ?? '')}
      style={{ minWidth: isMobile ? 140 : 160 }}
      aria-label={t('filters.role')}
    />
  )

  const columnsControl = (
    <ColumnSettings
      columns={[
        {
          key: 'nome',
          label: t('columns.name'),
          mandatory: true
        },
        { key: 'tipo', label: t('columns.type') },
        { key: 'email', label: t('columns.email') },
        { key: 'telefone', label: t('columns.phone') },
        { key: 'dataCriacao', label: t('columns.creationDate') }
      ]}
      visibleKeys={visibleKeys}
      onChange={onColumnsChange}
      onReset={onColumnsReset}
      title={t('columns.title')}
      resetLabel={t('columns.reset')}
      triggerLabel={t('columns.trigger')}
    />
  )

  const search = (
    <Input.Search
      value={draft}
      allowClear
      placeholder={t('search.placeholder')}
      onChange={event => {
        setDraft(event.target.value)
        if (event.target.value === '') onSearch('')
      }}
      onSearch={value => onSearch(value)}
      style={{
        width: isMobile ? '100%' : 360,
        maxWidth: '100%'
      }}
    />
  )

  const controls = (
    <Flex gap={8} wrap="wrap">
      {isNarrow
        ? (
          <Popover
            trigger="click"
            placement="bottomLeft"
            content={(
              <Flex vertical gap={8} style={{ minWidth: 200 }}>
                {roleSelect}
              </Flex>
            )}
          >
            <Button icon={<FilterOutlined />}>
              {t('filters.trigger')}
            </Button>
          </Popover>
        )
        : roleSelect}
      {columnsControl}
    </Flex>
  )

  if (isMobile) {
    return (
      <Flex vertical gap={12} style={{ marginBottom: 16 }}>
        {search}
        {controls}
      </Flex>
    )
  }

  return (
    <Flex
      gap={8}
      wrap="wrap"
      align="center"
      justify="space-between"
      style={{ marginBottom: 16 }}
    >
      {search}
      {controls}
    </Flex>
  )
}
