import { useEffect, useState } from 'react'

import {
  Button, Flex, Grid, Input, Popover, Select
} from 'antd6'
import { useTranslation } from 'react-i18next'

import { FilterOutlined } from '@ant-design/icons'

interface UsersToolbarProps {
  query: string
  role: string
  onSearch: (query: string) => void
  onRoleChange: (role: string) => void
}

export function UsersToolbar({
  query,
  role,
  onSearch,
  onRoleChange
}: UsersToolbarProps) {
  const { t } = useTranslation('listaUsuariosPage')
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

  const filters = isNarrow
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
    : roleSelect

  if (isMobile) {
    return (
      <Flex vertical gap={12}>
        {search}
        {filters}
      </Flex>
    )
  }

  return (
    <Flex
      gap={8}
      wrap="wrap"
      align="center"
    >
      {search}
      {filters}
    </Flex>
  )
}
