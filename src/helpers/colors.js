/**
 * Helper de cores do projeto HCF
 * Centraliza todas as cores utilizadas na aplicação
 */

export const colors = {
  // Cores principais
  primary: '#007A33',        // Verde principal do HCF
  primaryDark: '#005a26',    // Verde escuro
  primaryLight: '#4a9d5c',   // Verde claro
  
  // Cores neutras
  white: '#ffffff',
  black: '#000000',
  gray: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  
  // Cores de texto
  text: {
    primary: '#000000',
    secondary: '#666666',
    disabled: '#999999',
    inverse: '#ffffff',
  },
  
  // Cores de fundo
  background: {
    primary: '#ffffff',
    secondary: '#f5f5f5',
    dark: '#007A33',
  },
  
  // Cores de borda
  border: {
    light: '#d9d9d9',
    medium: '#e0e0e0',
    dark: '#bdbdbd',
  },
  
  // Cores de estado
  status: {
    success: '#52c41a',
    warning: '#faad14',
    error: '#ff4d4f',
    info: '#1890ff',
  },
  
  // Cores específicas do HCF
  hcf: {
    green: '#007A33',
    greenDark: '#005a26',
    greenLight: '#4a9d5c',
    logo: '#007A33',
  },
  
  // Cores de transparência
  transparent: {
    black: 'rgba(0, 0, 0, .25)',
    white: 'rgba(255, 255, 255, .8)',
    green: 'rgba(0, 122, 51, .1)',
  }
};

// Funções auxiliares para cores
export const colorUtils = {
  /**
   * Adiciona transparência a uma cor
   * @param {string} color - Cor em hex
   * @param {number} opacity - Opacidade de 0 a 1
   * @returns {string} Cor com transparência
   */
  withOpacity: (color, opacity) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  },
  
  /**
   * Retorna uma cor baseada no tema
   * @param {string} theme - 'light' ou 'dark'
   * @param {string} colorType - Tipo da cor
   * @returns {string} Cor apropriada para o tema
   */
  getThemeColor: (theme, colorType) => {
    const themeColors = {
      light: {
        primary: colors.primary,
        background: colors.background.primary,
        text: colors.text.primary,
      },
      dark: {
        primary: colors.primaryLight,
        background: colors.background.dark,
        text: colors.text.inverse,
      }
    };
    
    return themeColors[theme]?.[colorType] || colors.primary;
  }
};

export default colors;