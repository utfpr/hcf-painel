import React, { useState } from 'react'
import { Layout } from 'antd'
import Header from '../features/login/components/Header';
import MobileMenu from '../features/login/components/MobileMenu';

const { Content } = Layout

export default function AppLayout({ children }) {
  const [menuVisible, setMenuVisible] = useState(false)

  return (
    <Layout>
      <Header onShowMobileMenu={() => setMenuVisible(true)} />

      <Content>
        <div className="container">
          <div className="divOpaca">
            <div className="contentForm">{children}</div>
          </div>
        </div>
      </Content>

      <MobileMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />
    </Layout>
  )
}
