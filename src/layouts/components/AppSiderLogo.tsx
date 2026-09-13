import { Link } from 'react-router'

import logoColorida from '@/assets/img/logo_colorida.png'
import logoSimples from '@/assets/img/logo-simples-hcf.png'

interface AppSiderLogoProps {
  collapsed: boolean
}

export function AppSiderLogo({ collapsed }: AppSiderLogoProps) {
  return (
    <Link
      to="/dashboard"
      aria-label="HCF"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 68,
        padding: collapsed ? 8 : '8px 12px'
      }}
    >
      <img
        src={collapsed ? logoSimples : logoColorida}
        alt="UTFPR HCF"
        style={{
          maxHeight: collapsed ? 36 : 52,
          maxWidth: '100%',
          objectFit: 'contain'
        }}
      />
    </Link>
  )
}
