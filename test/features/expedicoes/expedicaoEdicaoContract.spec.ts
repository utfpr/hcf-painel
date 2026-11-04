import {
  describe, expect, it
} from 'vitest'

import {
  rotasIguais,
  toFormValues,
  toUpdateRotasPayload,
  type EditarExpedicaoFormValues,
  type ExpedicaoDetalhada
} from '@/features/expedicoes/api/expedicaoEdicaoContract'

function formulario(
  rotas: EditarExpedicaoFormValues['rotas']
): EditarExpedicaoFormValues {
  return {
    rotas
  } as EditarExpedicaoFormValues
}

describe('expedicaoEdicaoContract rotas', () => {
  it('monta rotas na ordem do formulário, com os locais marcados', () => {
    expect(toUpdateRotasPayload(formulario([
      {
        value: '10', label: 'Belém - PA', locaisColetaIds: [10, 122]
      },
      { value: 4, label: 'Curitiba - PR' }
    ]))).toEqual({
      rotas: [
        { cidade_id: 10, locais_coleta_ids: [10, 122] },
        { cidade_id: 4, locais_coleta_ids: [] }
      ]
    })
  })

  it('trata rota ausente como lista vazia', () => {
    expect(toUpdateRotasPayload(formulario(undefined))).toEqual({ rotas: [] })
  })

  it('considera iguais quando a ordem dos cidade_id não muda', () => {
    expect(rotasIguais(
      [{ cidade_id: 10, locais_coleta_ids: [1] }, { cidade_id: 4 }],
      [
        { cidade_id: 10, locais_coleta_ids: [1] },
        { cidade_id: 4, locais_coleta_ids: [] }
      ]
    )).toBe(true)
  })

  it('considera iguais quando só a ordem dos locais muda', () => {
    expect(rotasIguais(
      [{ cidade_id: 10, locais_coleta: [{ id: 10 }, { id: 122 }] }],
      [{ cidade_id: 10, locais_coleta_ids: [122, 10] }]
    )).toBe(true)
  })

  it('considera diferentes quando só a ordem das cidades muda', () => {
    expect(rotasIguais(
      [{ cidade_id: 10 }, { cidade_id: 4 }],
      [
        { cidade_id: 4, locais_coleta_ids: [] },
        { cidade_id: 10, locais_coleta_ids: [] }
      ]
    )).toBe(false)
  })

  it('considera diferentes quando um local entra ou sai', () => {
    expect(rotasIguais(
      [{ cidade_id: 10, locais_coleta_ids: [10] }],
      [{ cidade_id: 10, locais_coleta_ids: [10, 122] }]
    )).toBe(false)
  })

  it('considera diferentes quando uma parada entra ou sai', () => {
    expect(rotasIguais(
      [{ cidade_id: 10 }],
      []
    )).toBe(false)
    expect(rotasIguais(undefined, [])).toBe(true)
  })

  it('marca no formulário os locais já salvos na rota', () => {
    const expedicao = {
      id: 1,
      descricao: null,
      data_inicio: '2026-09-28',
      data_fim: '2026-10-02',
      cidade_id: 10,
      participantes: [],
      rotas: [
        {
          cidade_id: 11,
          nome_cidade: 'Belém',
          locais_coleta: [10, { id: 122, descricao: 'Igarapé' }]
        }
      ]
    } as ExpedicaoDetalhada

    expect(toFormValues(expedicao).rotas).toEqual([
      {
        value: 11,
        label: 'Belém',
        locaisColetaIds: [10, 122]
      }
    ])
  })
})
