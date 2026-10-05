import {
  describe, expect, it
} from 'vitest'

import {
  rotasIguais,
  toUpdateRotasPayload,
  type EditarExpedicaoFormValues
} from '@/features/expedicoes/api/expedicaoEdicaoContract'

function formulario(
  rotas: EditarExpedicaoFormValues['rotas']
): EditarExpedicaoFormValues {
  return {
    rotas
  } as EditarExpedicaoFormValues
}

describe('expedicaoEdicaoContract rotas', () => {
  it('monta rotas numéricas na ordem do formulário', () => {
    expect(toUpdateRotasPayload(formulario([
      { value: '10', label: 'Belém - PA' },
      { value: 4, label: 'Curitiba - PR' }
    ]))).toEqual({ rotas: [10, 4] })
  })

  it('trata rota ausente como lista vazia', () => {
    expect(toUpdateRotasPayload(formulario(undefined))).toEqual({ rotas: [] })
  })

  it('considera iguais quando a ordem dos cidade_id não muda', () => {
    expect(rotasIguais(
      [{ cidade_id: 10 }, { cidade_id: 4 }],
      [10, 4]
    )).toBe(true)
  })

  it('considera diferentes quando só a ordem muda', () => {
    expect(rotasIguais(
      [{ cidade_id: 10 }, { cidade_id: 4 }],
      [4, 10]
    )).toBe(false)
  })

  it('considera diferentes quando uma parada entra ou sai', () => {
    expect(rotasIguais([{ cidade_id: 10 }], [])).toBe(false)
    expect(rotasIguais(undefined, [])).toBe(true)
  })
})
