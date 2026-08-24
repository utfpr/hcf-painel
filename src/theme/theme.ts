import type { ThemeConfig } from 'antd6'
import { theme } from 'antd6'

const BRAND_GREEN = '#007A33'

export const herbariumLayout = {
  sidebarWidth: 240,
  sidebarCollapsedWidth: 68,
  headerHeight: 56,
  pagePaddingDesktop: 24,
  pagePaddingMobile: 16,
  tableRowHeight: 42
} as const

export function buildHerbariumTheme(isDark: boolean): ThemeConfig {
  return {
    algorithm: isDark
      ? [theme.darkAlgorithm, theme.compactAlgorithm]
      : [theme.defaultAlgorithm, theme.compactAlgorithm],
    token: {
      colorPrimary: BRAND_GREEN,
      colorLink: BRAND_GREEN,
      borderRadius: 8,
      fontSize: 14,
      controlHeight: 32
    },
    components: {
      Layout: {
        headerHeight: herbariumLayout.headerHeight,
        headerPadding: '0 16px',
        siderBg: isDark ? undefined : '#F7F8FA',
        headerBg: isDark ? undefined : '#FFFFFF',
        bodyBg: isDark ? undefined : '#F5F6F8'
      },
      Menu: {
        itemBorderRadius: 6,
        itemMarginInline: 8,
        iconSize: 16
      },
      Table: {
        headerBorderRadius: 8,
        cellPaddingBlockMD: 10,
        cellPaddingInlineMD: 12,
        cellFontSize: 14,
        cellFontSizeMD: 14
      },
      Button: {
        borderRadius: 6
      },
      Input: {
        borderRadius: 6
      },
      Select: {
        borderRadius: 6
      }
    }
  }
}
