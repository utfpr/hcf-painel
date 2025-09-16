// hcf-painel/src/features/login/components/MobileMenu.tsx

import React from 'react';
import { Drawer, Menu } from 'antd';
import { Link } from 'react-router-dom';
import styles from './MobileMenu.module.sass';
import { colors } from '../../../helpers/colors';

interface MobileMenuProps {
    visible: boolean;
    onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ visible, onClose }) => {
    return (
        <Drawer
            title="Menu"
            placement="right"
            onClose={onClose}
            visible={visible}
            width={280}
            bodyStyle={{ padding: 0 }}
            headerStyle={{
                backgroundColor: colors.hcf.green,
                color: colors.white,
                borderBottom: `1px solid ${colors.border.light}`
            }}
            className={styles.drawer}
        >
            <Menu
                mode="vertical"
                className={styles.menu}
                onClick={onClose}
            >
                <Menu.Item key="1" className={styles.menuItem}>
                    SOBRE O HCF
                </Menu.Item>
                <Menu.Item key="2" className={styles.menuItem}>
                    <Link to="/" className={styles.link}>DASHBOARD</Link>
                </Menu.Item>
                <Menu.Item key="3" className={styles.menuItem}>
                    BUSCAR
                </Menu.Item>
                <Menu.Item key="4" className={styles.menuItem}>
                    CONTATO
                </Menu.Item>
            </Menu>
        </Drawer>
    );
};

export default MobileMenu;