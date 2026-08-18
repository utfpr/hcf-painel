import { useEffect, useMemo, useState } from 'react'

import { Menu } from 'antd6'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router'

import { useAuth } from '@/contexts/Auth/useAuth'
import { isCuradorOuOperador } from '@/helpers/usuarios'

import {
  buildNavItems,
  getOpenMenuKeys,
  getSelectedMenuKey
} from '../navItems'
import { AppSiderLogo } from './AppSiderLogo'

interface AppSidebarProps {
  collapsed: boolean
  onNavigate?: () => void
}

export function AppSidebar({ collapsed, onNavigate }: AppSidebarProps) {
  const { t } = useTranslation()
  const auth = useAuth()
  const location = useLocation()
  const selectedKey = getSelectedMenuKey(location.pathname)
  const [openKeys, setOpenKeys] = useState<string[]>(() => getOpenMenuKeys(location.pathname))

  useEffect(() => {
    const requiredOpenKeys = getOpenMenuKeys(location.pathname)
    setOpenKeys(current => Array.from(new Set([...current, ...requiredOpenKeys])))
  }, [location.pathname])

  const items = useMemo(
    () => buildNavItems({
      t,
      auth,
      isCuradorOuOperador: isCuradorOuOperador()
    }),
    [t, auth]
  )

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      <AppSiderLogo collapsed={collapsed} />
      <div style={{ flex: 1, overflow: 'auto' }}>
        <Menu
          mode="inline"
          inlineCollapsed={collapsed}
          selectedKeys={selectedKey ? [selectedKey] : []}
          openKeys={collapsed ? [] : openKeys}
          onOpenChange={keys => setOpenKeys(keys)}
          onClick={onNavigate}
          items={items}
          style={{
            borderInlineEnd: 'none',
            background: 'transparent'
          }}
        />
      </div>
    </div>
  )
}
