// hcf-painel/src/features/login/components/Header.tsx

import React from 'react';
import { Row, Col, Menu, Button } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import styles from './Header.module.sass';

interface HeaderProps {
    onShowMobileMenu: () => void;
}

const Header: React.FC<HeaderProps> = ({ onShowMobileMenu }) => {
    return (
        <header className={styles.header}>
            <Row justify="space-between" align="middle" wrap={false}>
                <Col flex="none">
                    <div className="logo" />
                </Col>
                <Col flex="auto" style={{ overflow: 'hidden' }}>
                    <div className={styles.desktopMenu}>
                        <Menu
                            theme="dark"
                            mode="horizontal"
                            className={`${styles.menu} responsive-menu`}
                            overflowedIndicator={null}
                        >
                            <Menu.Item key="1" className={`${styles.menuItem} menu-item-responsive`}>SOBRE O HCF</Menu.Item>
                            <Menu.Item key="2" className={`${styles.menuItem} menu-item-responsive`}>
                                <Link to="/">DASHBOARD</Link>
                            </Menu.Item>
                            <Menu.Item key="3" className={`${styles.menuItem} menu-item-responsive`}>BUSCAR</Menu.Item>
                            <Menu.Item key="4" className={`${styles.menuItem} menu-item-responsive`}>CONTATO</Menu.Item>
                        </Menu>
                    </div>
                    {/* Botão Hambúrguer Mobile - visível apenas em telas pequenas */}
                    <div className={styles.mobileMenuButton}>
                        <Button
                            type="text"
                            icon={<MenuOutlined />}
                            onClick={onShowMobileMenu}
                            className={styles.mobileButton}
                        />
                    </div>
                </Col>
            </Row>
        </header>
    );
};

export default Header;