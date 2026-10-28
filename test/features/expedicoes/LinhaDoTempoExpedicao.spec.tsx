import {
  describe, expect, it, vi
} from 'vitest'

import LinhaDoTempoExpedicao from '@/features/expedicoes/components/LinhaDoTempoExpedicao'
import type { EventoLinha } from '@/features/expedicoes/linhaDoTempo'
import {
  render, screen
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

function evento(parcial: Partial<EventoLinha> & Pick<EventoLinha, 'id' | 'tipo' | 'capturadoEm'>): EventoLinha {
  return {
    observacoes: null,
    latitude: null,
    longitude: null,
    altitude: null,
    createdBy: null,
    coleta: null,
    arquivos: [],
    ...parcial
  }
}

const participantes = [{ id: 4, nome: 'Maria Silva' }]

describe('linha do tempo na tela', () => {
  it('mostra o carregamento da lista sem esconder o restante da página', () => {
    render(
      <LinhaDoTempoExpedicao
        eventos={[]}
        total={0}
        carregando
        erro={null}
        participantes={[]}
        onRecarregar={vi.fn()}
      />
    )
    expect(screen.getByText('Carregando eventos')).toBeInTheDocument()
  })

  it('avisa quando a expedição já começou e não tem evento', () => {
    render(
      <LinhaDoTempoExpedicao
        eventos={[]}
        total={0}
        carregando={false}
        erro={null}
        participantes={[]}
        onRecarregar={vi.fn()}
      />
    )
    expect(screen.getByText('Nenhum evento cadastrado para esta expedição.')).toBeInTheDocument()
  })

  it('lista do mais antigo ao mais novo, com card de coleta e card de diário', async () => {
    const usuario = userEvent.setup()
    render(
      <LinhaDoTempoExpedicao
        eventos={[
          evento({
            id: 1,
            tipo: 'COLETA',
            capturadoEm: '2026-10-11T09:00:00.000Z',
            coleta: {
              familia: null,
              nome_popular: null,
              nome_cientifico: 'Euterpe edulis',
              municipio: null,
              estado: null,
              referencia_local: null,
              tipo_vegetacao: null,
              solo: null,
              relevo: null,
              substrato: null,
              tronco_com_casca: null,
              associacoes: null,
              folhas: null,
              habito: null,
              frutos: null,
              flores: null,
              luminosidade: null
            },
            arquivos: [
              {
                id: 7,
                nome: 'Detalhe da folha',
                url: '/uploads/evidencias/folha.png',
                mimeType: 'image/png',
                tamanho: 30
              }
            ]
          }),
          evento({
            id: 2,
            tipo: 'DIARIO',
            capturadoEm: '2026-10-11T17:00:00.000Z',
            observacoes: 'Solo úmido',
            createdBy: 4,
            arquivos: [
              {
                id: 8,
                nome: 'Áudio do diário',
                url: '/uploads/evidencias/diario.wav',
                mimeType: 'audio/wav',
                tamanho: 20
              }
            ]
          })
        ]}
        total={2}
        carregando={false}
        erro={null}
        participantes={participantes}
        onRecarregar={vi.fn()}
      />
    )

    const texto = document.body.textContent ?? ''
    expect(texto.indexOf('Coleta')).toBeLessThan(texto.indexOf('Diário'))
    const diario = document.querySelector('[data-tipo="DIARIO"]')
    expect(diario?.textContent).toContain('Maria Silva')
    expect(diario?.textContent).toContain('Solo úmido')
    expect(diario?.textContent).not.toContain('Família')
    expect(screen.getByTitle('-')).toBeInTheDocument()

    await usuario.click(screen.getByText('Euterpe edulis'))
    expect(document.querySelector('[data-tipo="COLETA"]')?.textContent).toContain('Família')
    expect(screen.getByRole('button', { name: 'Ver imagem em tamanho real' })).toBeInTheDocument()
    await usuario.click(screen.getByText('Solo úmido'))
    expect(await screen.findByRole('link', { name: 'Baixar Áudio do diário' })).toHaveAttribute('href', '/uploads/evidencias/diario.wav')
    expect(document.querySelector('audio')).toHaveAttribute('src', '/uploads/evidencias/diario.wav')
    expect(document.querySelector('audio')).toHaveAttribute('controls')

    expect(screen.queryByPlaceholderText('Família')).toBeNull()
    await usuario.click(screen.getByRole('button', { name: /Adicionar filtro/ }))
    await usuario.click(await screen.findByRole('menuitem', { name: 'Família' }))
    expect(screen.getByPlaceholderText('Família')).toBeInTheDocument()
  })
})
