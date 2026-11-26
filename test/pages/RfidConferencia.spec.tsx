import { notification } from 'antd'
import axios from 'axios'
import { createInstance } from 'i18next'
import { I18nextProvider } from 'react-i18next'
import { SWRConfig } from 'swr'
import {
  beforeEach, describe, expect, it, vi
} from 'vitest'

import RfidConferencia from '@/pages/RfidConferencia'
import {
  render, screen, waitFor, within
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import ptBR from '../../public/locales/pt-BR/rfid.json'

vi.mock('axios', () => ({ default: { get: vi.fn(), delete: vi.fn() } }))

const vinculo = {
  id: 42,
  tombo_foto_id: 8,
  epc: '100-HCF000001',
  tid: 'E280001234',
  status: 'CONCLUIDO',
  tombos_foto: {
    id: 8, tombo_hcf: 100, codigo_barra: 'HCF000001'
  }
}

async function abrirEdicao() {
  const i18n = createInstance()
  await i18n.init({ lng: 'pt-BR', resources: { 'pt-BR': { rfid: ptBR } } })
  render(
    <SWRConfig value={{
      provider: () => new Map(), dedupingInterval: 0, shouldRetryOnError: false
    }}
    >
      <I18nextProvider i18n={i18n}><RfidConferencia /></I18nextProvider>
    </SWRConfig>
  )
  const user = userEvent.setup()
  await user.click(await screen.findByRole('button', { name: 'Editar' }))
  return { user, modal: within(screen.getByRole('dialog')) }
}

beforeEach(() => {
  vi.mocked(axios.get).mockResolvedValue({
    status: 200,
    data: {
      dados: [vinculo],
      meta: {
        pagina: 1, limite: 20, total: 1
      }
    }
  })
  vi.spyOn(notification, 'success').mockImplementation(() => undefined)
  vi.spyOn(notification, 'error').mockImplementation(() => undefined)
})

describe('edição do vínculo RFID', () => {
  it('desvincula somente ao salvar e atualiza a listagem', async () => {
    const { user, modal } = await abrirEdicao()
    expect(modal.getByText('E280001234')).toBeInTheDocument()
    expect(modal.getByRole('button', { name: 'Salvar' })).toBeDisabled()
    await user.click(modal.getByRole('button', { name: 'Desvincular etiqueta' }))
    expect(axios.delete).not.toHaveBeenCalled()
    vi.mocked(axios.delete).mockResolvedValue({ status: 204 })
    vi.mocked(axios.get).mockResolvedValue({
      status: 200,
      data: {
        dados: [],
        meta: {
          pagina: 1, limite: 20, total: 0
        }
      }
    })
    await user.click(modal.getByRole('button', { name: 'Salvar' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(axios.delete).toHaveBeenCalledExactlyOnceWith('/rfids/42')
    expect(screen.queryByText('E280001234')).not.toBeInTheDocument()
  })

  it('cancelar descarta a desvinculação e mantém o vínculo', async () => {
    const { user, modal } = await abrirEdicao()
    await user.click(modal.getByRole('button', { name: 'Desvincular etiqueta' }))
    await user.click(modal.getByRole('button', { name: 'Cancelar' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(axios.delete).not.toHaveBeenCalled()
    expect(screen.getByText('E280001234')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Editar' }))
    expect(within(screen.getByRole('dialog')).getByRole('button', { name: 'Salvar' })).toBeDisabled()
  })

  it('preserva a edição quando a API falha e permite tentar novamente', async () => {
    const { user, modal } = await abrirEdicao()
    await user.click(modal.getByRole('button', { name: 'Desvincular etiqueta' }))
    vi.mocked(axios.delete).mockRejectedValue(new Error('Network error'))
    await user.click(modal.getByRole('button', { name: 'Salvar' }))
    await waitFor(() => expect(notification.error).toHaveBeenCalled())
    expect(modal.getByText('E280001234')).toBeInTheDocument()
    await waitFor(() => expect(modal.getByRole('button', { name: /Salvar/ })).toBeEnabled())
    expect(axios.get).toHaveBeenCalledTimes(1)
  })

  it('impede outro envio e o cancelamento enquanto salva', async () => {
    const { user, modal } = await abrirEdicao()
    await user.click(modal.getByRole('button', { name: 'Desvincular etiqueta' }))
    let concluir!: () => void
    vi.mocked(axios.delete).mockReturnValue(new Promise(resolve => {
      concluir = () => resolve({ status: 204 })
    }))
    await user.click(modal.getByRole('button', { name: 'Salvar' }))
    await user.click(modal.getByRole('button', { name: /Salvar/ }))
    expect(axios.delete).toHaveBeenCalledTimes(1)
    expect(modal.getByRole('button', { name: 'Cancelar' })).toBeDisabled()
    concluir()
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('mantém o filtro e volta à página anterior ao remover o último vínculo da página', async () => {
    const { user, modal } = await abrirEdicao()
    await user.click(modal.getByRole('button', { name: 'Cancelar' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    vi.mocked(axios.get).mockResolvedValue({
      status: 200,
      data: {
        dados: [vinculo],
        meta: {
          pagina: 1, limite: 20, total: 21
        }
      }
    })
    await user.type(screen.getByLabelText('Tombo'), '100')
    await user.click(screen.getByRole('button', { name: /Pesquisar/ }))
    vi.mocked(axios.get).mockResolvedValue({
      status: 200,
      data: {
        dados: [vinculo],
        meta: {
          pagina: 2, limite: 20, total: 21
        }
      }
    })
    await user.click(await screen.findByTitle('2'))
    await waitFor(() => expect(axios.get).toHaveBeenLastCalledWith('/rfids', {
      params: expect.objectContaining({ pagina: 2, tombo_hcf: '100' })
    }))
    await user.click(screen.getByRole('button', { name: 'Editar' }))
    const edicao = within(screen.getByRole('dialog'))
    await user.click(edicao.getByRole('button', { name: 'Desvincular etiqueta' }))
    vi.mocked(axios.delete).mockResolvedValue({ status: 204 })
    await user.click(edicao.getByRole('button', { name: 'Salvar' }))
    await waitFor(() => expect(axios.get).toHaveBeenLastCalledWith('/rfids', {
      params: expect.objectContaining({
        pagina: 1, limite: 20, tombo_hcf: '100'
      })
    }))
  })
})
