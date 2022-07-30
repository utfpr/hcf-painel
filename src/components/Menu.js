/* eslint-disable react-perf/jsx-no-new-array-as-prop */
import React from 'react';

import { Menu as MenuAntd } from 'antd';
import { useNavigate } from 'react-router-dom';

import routes from '../routes/admin';
import styles from './Menu.module.scss';

const MenuItem = ({ route, key }) => {
    const { menu, path } = route;
    const navigate = useNavigate();
    const onClick = () => {
        navigate(path.replace('/', ''));
    };

    return (
        <MenuAntd.Item
            key={key}
            icon={(
                <menu.icon
                    size={16}
                    className={styles.icon}
                />
            )}
            onClick={onClick}
        >
            {menu.text}
        </MenuAntd.Item>
    );
};

const Menu = () => {
    return (
        <MenuAntd theme="dark" mode="horizontal" defaultSelectedKeys={['1']} className={styles.menu}>
            {routes.map((route, index) => {
                const { menu } = route;
                if (menu) {
                    const key = index + 1;
                    return (
                        <MenuItem route={route} key={`${key}}`} />
                    );
                }
                return undefined;
            })}
        </MenuAntd>
    );
};

export default Menu;
