import { Form } from 'antd'
import {
  describe, expect, it, vi
} from 'vitest'

import { RotaFormField } from '@/features/expedicoes/components/RotaFormField'
import type { LocalColetaItem, ParadaRotaForm } from '@/features/expedicoes/types'
import {
  render, screen, waitFor
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}))

function Harness({
  buscarLocais,
  onChange
}: {
  buscarLocais: (cidadeId: number) => Promise<LocalColetaItem[]>
  onChange: (rotas: ParadaRotaForm[]) => void
}) {
  const [form] = Form.useForm()

  return (
    <Form
      form={form}
      initialValues={{
        rotas: [
          {
            value: 11, label: 'Belém - PA', locaisColetaIds: [10]
          }
        ]
      }}
      onValuesChange={(_changed, all: { rotas: ParadaRotaForm[] }) => onChange(all.rotas)}
    >
      <RotaFormField buscar={() => Promise.resolve([])} buscarLocais={buscarLocais} />
    </Form>
  )
}

describe('RotaFormField locais de coleta', () => {
  it('lista só os locais da cidade da rota e marca presença', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const buscarLocais = vi.fn((cidadeId: number) => {
      if (cidadeId !== 11) return Promise.resolve([])
      return Promise.resolve([
        { id: '10', descricao: 'Igarapé' },
        { id: '122', descricao: 'Praia' }
      ])
    })

    render(<Harness buscarLocais={buscarLocais} onChange={onChange} />)

    const toggle = await screen.findByRole('button', { name: /Belém/ })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('checkbox', { name: 'Igarapé' })).not.toBeInTheDocument()

    await user.click(toggle)

    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    const igarape = await screen.findByRole('checkbox', { name: 'Igarapé' })
    const linhaTitulo = toggle.parentElement?.parentElement
    const subir = screen.getByRole('button', { name: 'novaExpedicaoPage:rota.subir' })
    expect(linhaTitulo?.contains(subir)).toBe(true)
    expect(linhaTitulo?.contains(igarape)).toBe(false)
    expect(igarape).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Praia' })).not.toBeChecked()
    expect(buscarLocais).toHaveBeenCalledWith(11)

    await user.click(screen.getByRole('checkbox', { name: 'Praia' }))

    await waitFor(() => {
      expect(screen.getByRole('checkbox', { name: 'Praia' })).toBeChecked()
    })
    const ultima = onChange.mock.calls.at(-1)?.[0] as ParadaRotaForm[]
    expect(ultima[0].locaisColetaIds).toEqual([10, 122])
  })

  it('não mostra ícone quando a cidade não tem local', async () => {
    render(
      <Harness
        buscarLocais={() => Promise.resolve([])}
        onChange={vi.fn()}
      />
    )

    expect(await screen.findByText('1. Belém - PA')).toBeInTheDocument()
    await waitFor(() => {
      expect(document.querySelector('.ant-spin')).not.toBeInTheDocument()
    })
    expect(screen.queryByRole('button', { name: /Belém/ })).not.toBeInTheDocument()
    expect(screen.queryByText('rota.semLocais')).not.toBeInTheDocument()
  })
})
