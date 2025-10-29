// hcf-painel/src/hooks/useMobileMenu.ts

import { useState } from 'react';

export const useMobileMenu = () => {
  const [mobileMenuVisible, setMobileMenuVisible] = useState<boolean>(false);

  const showMobileMenu = () => setMobileMenuVisible(true);
  const closeMobileMenu = () => setMobileMenuVisible(false);

  return {
    mobileMenuVisible,
    showMobileMenu,
    closeMobileMenu
  };
};