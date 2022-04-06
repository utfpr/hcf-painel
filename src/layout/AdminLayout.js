import React, {
  Suspense, useCallback, useMemo, useState,
} from 'react';

import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from '@ant-design/icons';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';

import styles from './AdminLayout.module.scss';
import AdminSideMenu from './AdminSideMenu';

const { Header, Content } = Layout;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  const toggle = useCallback(() => {
    setCollapsed(!collapsed);
  }, [collapsed]);

  const contentLayoutStyle = useMemo(() => {
    return collapsed ? { marginLeft: '80px' } : null;
  }, [collapsed]);

  return (
    <Layout className={styles.rootLayout}>
      <AdminSideMenu collapsed={collapsed} />
      <Layout className={styles.contentLayout} style={contentLayoutStyle}>
        <Header className={styles.header}>
          {collapsed ? (
            <MenuUnfoldOutlined onClick={toggle} />
          ) : (
            <MenuFoldOutlined onClick={toggle} />
          )}
        </Header>
        <Content className={styles.content}>
          <Suspense fallback={<div>Carregando...</div>}>
            <Outlet />
          </Suspense>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
