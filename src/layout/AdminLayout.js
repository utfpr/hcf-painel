/* eslint-disable no-unused-vars */
/* eslint-disable react-perf/jsx-no-new-object-as-prop */
import React, {
    Suspense,
} from 'react';

import { Layout, Breadcrumb } from 'antd';
import { Link, Outlet } from 'react-router-dom';

import Menu from '../components/Menu';
import styles from './AdminLayout.module.scss';

const { Header, Content } = Layout;

const AdminLayout = () => {
    return (
        <Layout className={styles.rootLayout}>
            <Header className={styles.header}>
                <Link to="/admin">
                    <div className={styles.logo} />
                </Link>
                <Menu />
            </Header>
            <Content className={styles.content}>
                <Breadcrumb style={{ margin: '16px 0' }}>
                    <Breadcrumb.Item>Home</Breadcrumb.Item>
                    <Breadcrumb.Item>List</Breadcrumb.Item>
                    <Breadcrumb.Item>App</Breadcrumb.Item>
                </Breadcrumb>
                <Suspense fallback={<div>Carregando...</div>}>
                    <div className={styles.body}>
                        <Outlet />
                    </div>
                </Suspense>
            </Content>
        </Layout>
    );
};

export default AdminLayout;
