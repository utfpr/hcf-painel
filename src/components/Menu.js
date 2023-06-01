/* eslint-disable react-perf/jsx-no-new-array-as-prop */
/* eslint-disable no-undef */
import React, {
  useMemo, useCallback, useEffect, useState,
} from 'react';

import { Menu as MenuAntd } from 'antd';
import { useNavigate } from 'react-router-dom';

import routes from '../routes/admin';
import styles from './Menu.module.scss';

function getItem(label, key, icon, children, type) {
  return {
    key,
    icon,
    children,
    label,
    type,
  };
}

const Menu = () => {
  const navigate = useNavigate();
  const [selectedMenu, setSelectedMenu] = useState();
  const items = useMemo(() => {
    return routes.filter(route => route.menu).map(route => {
      const { menu } = route;
      return getItem(menu.text, menu.key, <menu.icon />);
    });
  }, []);

  useEffect(() => {
    setSelectedMenu(localStorage.getItem('menuSelecionado'));
  }, []);

  const onClick = useCallback(({ key }) => {
    const route = routes.find(rout => rout.menu && rout.menu.key === key);
    navigate(route.path.replace('/', ''));
    localStorage.setItem('menuSelecionado', key);
  }, [navigate]);

  return (
    <MenuAntd
      defaultSelectedKeys={[selectedMenu]}
      mode="horizontal"
      theme="dark"
      items={items}
      onClick={onClick}
      className={styles.menu}
    />
  );
};
export default Menu;
