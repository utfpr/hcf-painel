import React from 'react';

import { Layout, Menu } from 'antd';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import routes from '../routes/admin';
import styles from './AdminSideMenu.module.scss';

const defaultSelectedKeys = ['1'];

const AdminSideMenu = ({ theme, collapsed }) => {
    const renderGroupItem = route => {
        const { group } = route;
        return (
            <Menu.SubMenu key={group.key} title={group.text} icon={<group.icon />}>
                {/* eslint-disable-next-line no-use-before-define */}
                {route.routes.map(renderMenuItem)}
            </Menu.SubMenu>
        );
    };

    const renderMenuItem = route => {
        if (route.group) {
            return renderGroupItem(route);
        }

        const { menu } = route;
        const path = `/admin/${route.path.replace('/', '')}`;
        return (
            <Menu.Item key={path} icon={<route.menu.icon />}>
                <Link to={path}>
                    {menu.text}
                </Link>
            </Menu.Item>
        );
    };

    return (
        <Layout.Sider
            collapsible
            theme={theme}
            className={styles.sider}
            trigger={null}
            collapsed={collapsed}
        >
            <div className={styles.logo} />
            <Menu
                mode="inline"
                theme={theme}
                defaultSelectedKeys={defaultSelectedKeys}
            >
                {routes.map(renderMenuItem)}
            </Menu>
        </Layout.Sider>
    );
};

AdminSideMenu.propTypes = {
    theme: PropTypes.oneOf([
        'light',
        'dark',
    ]),
    collapsed: PropTypes.bool,
};

AdminSideMenu.defaultProps = {
    theme: 'dark',
    collapsed: false,
};

export default AdminSideMenu;
