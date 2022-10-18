import React, { useCallback, useState } from 'react';

import { Menu as MenuAntd } from 'antd';
import { useNavigate } from 'react-router-dom';

import routes from '../routes/admin';
import styles from './Menu.module.scss';

const MenuItem = ({ route, id, onSelect }) => {
  const { menu, path } = route;
  const navigate = useNavigate();
  const onClick = () => {
    navigate(path.replace('/', ''));
    onSelect(id);
  };
  return (
    <MenuAntd.Item
      key={`menuantditem-${id}`}
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

const selectedItemStyle = {
  backgroundColor: '#ffe363',
};

const itemStyle = {
  backgroundColor: '#33bc84',
};

const Menu = () => {
  const [selectedItem, setSelectedItem] = useState(null);

  const onSelectItem = useCallback(id => {
    setSelectedItem(id);
  }, []);

  return (
    <MenuAntd theme="dark" mode="horizontal" className={styles.menu}>
      {routes.map(route => {
        const { menu } = route;
        if (menu) {
          const isSelected = selectedItem === menu.key;
          return (
            <MenuItem
              route={route}
              id={menu.key}
              onSelect={onSelectItem}
              style={isSelected ? selectedItemStyle : itemStyle}
            />
          );
        }
        return undefined;
      })}
    </MenuAntd>
  );
};

export default Menu;
