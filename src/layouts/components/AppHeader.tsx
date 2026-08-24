import { useMemo } from 'react'

import {
  Avatar,
  Button,
  Dropdown,
  Flex,
  Select,
  Tag,
  Typography
} from 'antd6'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { useAuth } from '@/contexts/Auth/useAuth'
import { useAppearance } from '@/theme/useAppearance'
import type { AppearanceMode } from '@/theme/appearance'
import {
  BgColorsOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined
} from '@ant-design/icons'

const APP_ENV = import.meta.env.VITE_APP_ENV ?? 'development'

interface AppHeaderProps {
  collapsed: boolean
  isMobile: boolean
  onToggle: () => void
}

function getInitials(name?: string): string {
  if (!name) return ''
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function AppHeader({
  collapsed, isMobile, onToggle
}: AppHeaderProps) {
  const { t, i18n } = useTranslation()
  const auth = useAuth()
  const navigate = useNavigate()
  const { mode, setAppearance } = useAppearance()

  const language = (i18n.resolvedLanguage || i18n.language || 'pt-BR')
    .toLowerCase()
    .startsWith('pt')
    ? 'pt-BR'
    : (i18n.resolvedLanguage || i18n.language || 'en')

  const envTag = useMemo(() => {
    const env = APP_ENV.toLowerCase()
    if (env === 'production') return null
    if (env === 'staging') {
      return (
        <Tag color="orange" style={{ marginInlineEnd: 0 }}>
          {t('mainLayout:ambienteStaging')}
        </Tag>
      )
    }
    return (
      <Tag color="blue" style={{ marginInlineEnd: 0 }}>
        {t('mainLayout:ambienteDesenvolvimento')}
      </Tag>
    )
  }, [t])

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: t('common:perfil'),
      onClick: () => navigate('/perfil')
    },
    {
      type: 'divider' as const
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('common:sair'),
      onClick: () => {
        auth.logOut()
        void navigate('/inicio')
      }
    }
  ]

  const appearanceItems = [
    {
      key: 'system',
      label: t('mainLayout:aparenciaSistema'),
      onClick: () => setAppearance('system' satisfies AppearanceMode)
    },
    {
      key: 'light',
      label: t('mainLayout:aparenciaClara'),
      onClick: () => setAppearance('light')
    },
    {
      key: 'dark',
      label: t('mainLayout:aparenciaEscura'),
      onClick: () => setAppearance('dark')
    }
  ]

  return (
    <Flex
      align="center"
      justify="space-between"
      gap={12}
      style={{ height: '100%', width: '100%' }}
    >
      <Flex align="center" gap={12}>
        <Button
          type="text"
          aria-label={t('mainLayout:alternarMenu')}
          icon={collapsed || isMobile ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggle}
        />
        {envTag}
      </Flex>

      <Flex align="center" gap={8}>
        <Select
          size="small"
          value={language.startsWith('en') ? 'en' : language.startsWith('es') ? 'es' : 'pt-BR'}
          onChange={value => {
            void i18n.changeLanguage(value)
          }}
          style={{ width: isMobile ? 88 : 132 }}
          aria-label={t('mainLayout:idioma')}
          options={[
            { value: 'pt-BR', label: t('tombo:languagePortuguese') },
            { value: 'en', label: t('tombo:languageEnglish') },
            { value: 'es', label: t('tombo:languageSpanish') }
          ]}
        />

        <Dropdown
          menu={{
            items: appearanceItems,
            selectedKeys: [mode]
          }}
          trigger={['click']}
        >
          <Button
            type="text"
            aria-label={t('mainLayout:aparencia')}
            icon={<BgColorsOutlined />}
          />
        </Dropdown>

        {auth.loggedIn
          ? (
              <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
                <Button
                  type="text"
                  style={{ height: 40, paddingInline: 8 }}
                  aria-label={t('mainLayout:menuConta')}
                >
                  <Flex align="center" gap={8}>
                    <Avatar size="small" style={{ backgroundColor: '#007A33' }}>
                      {getInitials(auth.user?.nome) || <UserOutlined />}
                    </Avatar>
                    {!isMobile && (
                      <Typography.Text
                        ellipsis
                        style={{ maxWidth: 160 }}
                      >
                        {auth.user?.nome}
                      </Typography.Text>
                    )}
                  </Flex>
                </Button>
              </Dropdown>
            )
          : (
              <Button type="text" onClick={() => void navigate('/inicio')}>
                {t('common:entrar')}
              </Button>
            )}
      </Flex>
    </Flex>
  )
}
