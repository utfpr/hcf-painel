import axios from 'axios'
import {
  afterEach, describe, expect, it, vi
} from 'vitest'

import { TranscricaoAudio } from '@/features/expedicoes/components/TranscricaoAudio'
import {
  cleanup, render, screen, waitFor
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('axios', () => ({
  default: {
    get: vi.fn(), post: vi.fn(), patch: vi.fn(), isAxiosError: (value: unknown) => Boolean(value && typeof value === 'object' && 'isAxiosError' in value)
  }
}))
afterEach(cleanup)
const arquivo = {
  id: 3, nome: 'Áudio da coleta', url: '/uploads/audio.m4a', mimeType: 'audio/mp4', tamanho: 30
}
const original = {
  evidencia_id: 3, status: 'concluida', texto_original: 'Uma árvore.', texto_revisado: null, versao: 1, gerado_por_nome: 'Maria', gerado_em: '2026-11-06T12:00:00Z', revisado_em: null
}

async function abrir() {
  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: 'Transcrever' }))
  return user
}

describe('transcrição de áudio', () => {
  it('gera a transcrição e permite corrigir sem perder o original', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: null })
    vi.mocked(axios.post).mockResolvedValue({ data: original })
    render(<TranscricaoAudio arquivo={arquivo} podeEditar />)
    const user = await abrir()
    expect(await screen.findByText('Uma árvore.')).toBeInTheDocument()
    expect(axios.post).toHaveBeenCalledWith('/v1/evidencias/3/transcricao', undefined, { timeout: 90000 })
    await user.click(screen.getByRole('button', { name: 'Editar' }))
    await user.clear(screen.getByRole('textbox', { name: 'Texto revisado' }))
    await user.type(screen.getByRole('textbox', { name: 'Texto revisado' }), 'Uma árvore alta.')
    vi.mocked(axios.patch).mockResolvedValue({
      data: {
        ...original, texto_revisado: 'Uma árvore alta.', versao: 2
      }
    })
    await user.click(screen.getByRole('button', { name: 'Salvar correção' }))
    expect(await screen.findByText('Uma árvore alta.')).toBeInTheDocument()
    expect(axios.patch).toHaveBeenCalledWith('/v1/evidencias/3/transcricao', { texto_revisado: 'Uma árvore alta.', versao: 1 })
    await user.click(screen.getByText('Texto original'))
    expect(await screen.findByText('Uma árvore.')).toBeInTheDocument()
  })

  it('consulta resultado salvo sem gerar novamente e permite copiar', async () => {
    const user = userEvent.setup()
    vi.mocked(axios.get).mockResolvedValue({ data: original })
    render(<TranscricaoAudio arquivo={{ ...arquivo, transcricao: { status: 'concluida', versao: 1 } }} podeEditar={false} />)
    await user.click(screen.getByRole('button', { name: 'Ver transcrição' }))
    expect(await screen.findByText('Uma árvore.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Copiar' }))
    expect(await screen.findByRole('button', { name: 'Copiado' })).toBeInTheDocument()
    expect(axios.post).not.toHaveBeenCalled()
    expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument()
  })

  it('preserva a edição em conflito e permite recarregar a versão atual', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: original })
    render(<TranscricaoAudio arquivo={arquivo} podeEditar />)
    const user = await abrir()
    await user.click(await screen.findByRole('button', { name: 'Editar' }))
    const input = screen.getByRole('textbox', { name: 'Texto revisado' })
    await user.type(input, ' Texto local.')
    vi.mocked(axios.patch).mockRejectedValue({ isAxiosError: true, response: { data: { error: { type: 'versao_conflitante', message: 'Outra pessoa alterou.' } } } })
    await user.click(screen.getByRole('button', { name: 'Salvar correção' }))
    await screen.findByText('Outra pessoa alterou.')
    expect(input).toHaveValue('Uma árvore. Texto local.')
    expect(screen.getByRole('button', { name: 'Salvar correção' })).toBeDisabled()
    vi.mocked(axios.get).mockResolvedValue({
      data: {
        ...original, versao: 2, texto_revisado: 'Texto remoto.'
      }
    })
    await user.click(screen.getByRole('button', { name: 'Recarregar versão atual' }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Salvar correção' })).toBeEnabled())
    expect(input).toHaveValue('Uma árvore. Texto local.')
  })

  it('acompanha uma tentativa de outra pessoa sem gerar novamente', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: {
        ...original,
        status: 'processando',
        texto_original: null,
        processamento_expira_em: new Date(Date.now() + 60000).toISOString()
      }
    }).mockResolvedValue({ data: original })
    render(<TranscricaoAudio arquivo={arquivo} podeEditar />)
    await abrir()
    expect(await screen.findByRole('status')).toHaveTextContent('Transcrevendo')
    expect(await screen.findByText('Uma árvore.', {}, { timeout: 4500 })).toBeInTheDocument()
    expect(axios.post).not.toHaveBeenCalled()
  })

  it('cancelar uma correção preserva o texto salvo', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: original })
    render(<TranscricaoAudio arquivo={arquivo} podeEditar />)
    const user = await abrir()
    await user.click(await screen.findByRole('button', { name: 'Editar' }))
    await user.type(screen.getByRole('textbox', { name: 'Texto revisado' }), ' Rascunho.')
    await user.click(screen.getByRole('button', { name: 'Cancelar edição' }))
    expect(screen.getByText('Uma árvore.')).toBeInTheDocument()
    expect(axios.patch).not.toHaveBeenCalled()
  })

  it('exibe falha e disponibiliza nova tentativa', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: null })
    vi.mocked(axios.post).mockRejectedValue({ isAxiosError: true, response: { data: { error: { message: 'Serviço indisponível.' } } } })
    render(<TranscricaoAudio arquivo={arquivo} podeEditar />)
    const user = await abrir()
    expect(await screen.findByText('Serviço indisponível.')).toBeInTheDocument()
    vi.mocked(axios.post).mockResolvedValue({ data: original })
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }))
    expect(await screen.findByText('Uma árvore.')).toBeInTheDocument()
  })
})
