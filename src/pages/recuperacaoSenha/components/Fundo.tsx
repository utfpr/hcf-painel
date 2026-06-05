import {
  Row, Col, Menu, Layout
} from 'antd'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import logoImage from '../../../assets/img/leaves.png'

const { Header, Content } = Layout

type Props = {
  children?: React.ReactNode
}

export default function Fundo({ children }: Props) {
  const { t } = useTranslation()
  return (
    <Layout>
      <Header>
        <div className="logo" />
        <Menu
          theme="dark"
          mode="horizontal"
          style={{ lineHeight: '64px' }}
        >
          <Menu.Item key="1">{t('fundo:sobreHcf')}</Menu.Item>
          <Menu.Item key="2">
            <a href="/">{t('fundo:dashboard')}</a>
          </Menu.Item>
          <Menu.Item key="3">{t('fundo:buscar')}</Menu.Item>
          <Menu.Item key="4">{t('fundo:contato')}</Menu.Item>
        </Menu>
      </Header>
      <Content>
        <div className="container">
          <div className="divOpaca">
            <div className="contentForm">
              <Row justify="center" align="middle">
                <Col span={16} className="style-form">
                  <Row
                    justify="center"
                    align="middle"
                    style={{ marginBottom: '10px' }}
                  >
                    <Col span={6}>
                      <img
                        src={logoImage}
                        alt="leaves"
                        height="105"
                        width="105"
                      />
                    </Col>
                  </Row>
                  <Row
                    justify="center"
                    align="middle"
                    style={{ marginBottom: '10px' }}
                  >
                    <span style={{ textAlign: 'center', width: '100%' }}>
                      {t('fundo:nomeHerbario')}
                    </span>
                  </Row>
                  <Row justify="center">
                    <Col span={24}>
                      {children}
                    </Col>
                  </Row>
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </Content>
    </Layout>
  )
}
