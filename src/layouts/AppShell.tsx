import { useState, type ReactNode } from 'react'

import {
  Drawer,
  Grid,
  Layout,
  theme
} from 'antd6'

import { herbariumLayout } from '@/theme/herbariumTheme'

import { AppHeader } from './components/AppHeader'
import { AppSidebar } from './components/AppSidebar'

const {
  Header,
  Sider,
  Content
} = Layout

interface AppShellProps {
  children?: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const { token } = theme.useToken()
  const screens = Grid.useBreakpoint()
  const isMobile = screens.md === false
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const pagePadding = isMobile
    ? herbariumLayout.pagePaddingMobile
    : herbariumLayout.pagePaddingDesktop

  const closeMobile = () => setMobileOpen(false)

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {!isMobile && (
        <Sider
          theme="light"
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={herbariumLayout.sidebarWidth}
          collapsedWidth={herbariumLayout.sidebarCollapsedWidth}
          style={{
            borderInlineEnd: `1px solid ${token.colorBorderSecondary}`,
            position: 'sticky',
            top: 0,
            height: '100vh',
            overflow: 'hidden'
          }}
        >
          <AppSidebar collapsed={collapsed} />
        </Sider>
      )}

      <Layout>
        <Header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 20,
            lineHeight: `${herbariumLayout.headerHeight}px`,
            borderBottom: `1px solid ${token.colorBorderSecondary}`
          }}
        >
          <AppHeader
            collapsed={collapsed}
            isMobile={isMobile}
            onToggle={() => {
              if (isMobile) {
                setMobileOpen(open => !open)
                return
              }
              setCollapsed(value => !value)
            }}
          />
        </Header>

        <Content
          style={{
            padding: pagePadding,
            minHeight: 280
          }}
        >
          {children}
        </Content>
      </Layout>

      {isMobile && (
        <Drawer
          placement="left"
          open={mobileOpen}
          onClose={closeMobile}
          width={herbariumLayout.sidebarWidth}
          styles={{ body: { padding: 0 } }}
        >
          <AppSidebar collapsed={false} onNavigate={closeMobile} />
        </Drawer>
      )}
    </Layout>
  )
}
