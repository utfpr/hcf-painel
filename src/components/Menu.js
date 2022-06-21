import React from 'react';

import { Menu as MenuAntd } from 'antd';
import { useNavigate } from 'react-router-dom';

import routes from '../routes/admin';
import styles from './Menu.module.scss';

const MenuItem = ({ route }) => {
    const { menu, path } = route;
    const navigate = useNavigate();
    const onClick = () => {
        navigate(path.replace('/', ''));
    };

    return (
        <MenuAntd.Item
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
        <MenuAntd theme="dark" mode="horizontal" className={styles.menu}>
            {routes.map((route, index) => {
                const { menu, path } = route;
                if (menu) {
                    const key = index + 1;
                    return (
                        <MenuItem route={route} key={`${key}/${path}`} />
                    );
                }
                return undefined;
            })}
        </MenuAntd>
    );
};

export default Menu;
