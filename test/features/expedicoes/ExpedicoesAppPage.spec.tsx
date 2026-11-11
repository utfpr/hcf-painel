import {
  afterEach, describe, expect, it, vi
} from 'vitest'

import { render, screen } from '@testing-library/react'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}))

async function renderPage(url: string) {
  vi.resetModules()
  vi.doMock('@/config/app', () => ({ appDownloadUrl: url }))
  const { default: ExpedicoesAppPage } = await import('@/features/expedicoes/ExpedicoesAppPage')
  render(<ExpedicoesAppPage />)
}

describe('ExpedicoesAppPage', () => {
  afterEach(() => {
    vi.doUnmock('@/config/app')
  })

  it('aponta o botão para a URL de download configurada', async () => {
    await renderPage('https://exemplo.com/app.apk')

    const link = screen.getByRole('link', { name: /baixar/ })
    expect(link.getAttribute('href')).toBe('https://exemplo.com/app.apk')
  })

  it('mostra o aviso "em breve" no lugar do botão quando não há URL configurada', async () => {
    await renderPage('')

    expect(screen.getByRole('alert').textContent).toContain('emBreve')
    expect(screen.queryByRole('button')).toBeNull()
    expect(screen.queryByRole('link')).toBeNull()
  })
})
