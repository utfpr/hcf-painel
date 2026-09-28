import moment from 'moment'
import {
  describe, expect, it
} from 'vitest'

import {
  EXPEDICOES_ENDPOINT,
  extractApiErrorMessage,
  toCreateExpedicaoPayload
} from '@/features/expedicoes/api/expedicaoContract'

describe('expedicaoContract', () => {
  const dataInicio = moment.parseZone('2026-09-28T23:30:00-03:00')
  const dataFim = moment.parseZone('2026-10-02T18:00:00-03:00')

  it('aponta para o endpoint v2 da API', () => {
    expect(EXPEDICOES_ENDPOINT).toBe('/v2/expedicoes')
  })

  it('monta o payload com a data local em YYYY-MM-DD (coluna date da API)', () => {
    const payload = toCreateExpedicaoPayload({
      dataInicio,
      dataFim,
      destino: 10,
      descricao: '  Coleta no litoral  ',
      participantes: [3, 7],
      rotas: [
        10,
        4,
        10
      ]
    })

    expect(payload).toEqual({
      descricao: 'Coleta no litoral',
      data_inicio: '2026-09-28',
      data_fim: '2026-10-02',
      cidade_id: 10,
      participantes: [3, 7],
      rotas: [
        10,
        4,
        10
      ]
    })
  })

  it('sempre envia data_fim, não envia created_by, e rotas vira lista vazia', () => {
    const payload = toCreateExpedicaoPayload({
      dataInicio,
      dataFim,
      destino: 1,
      descricao: 'Teste',
      participantes: [1]
    })

    expect(payload).not.toHaveProperty('created_by')
    expect(payload.data_fim).toBe('2026-10-02')
    expect(payload.rotas).toEqual([])
  })

  it('lê o id do labelInValue só no payload e mantém o label fora do body', () => {
    const payload = toCreateExpedicaoPayload({
      dataInicio,
      dataFim,
      destino: { value: '4104808', label: 'Cascavel - PR' },
      descricao: 'Cascavel',
      participantes: [{ value: 3, label: 'Ana' }],
      rotas: [{ value: '10', label: 'Belém - PA' }]
    })

    expect(payload.cidade_id).toBe(4104808)
    expect(payload.participantes).toEqual([3])
    expect(payload.rotas).toEqual([10])
    expect(payload).not.toHaveProperty('label')
  })

  it('converte ids string do Select para número no payload da API', () => {
    const payload = toCreateExpedicaoPayload({
      dataInicio,
      dataFim,
      destino: '4104808',
      descricao: 'Cascavel',
      participantes: ['3', '7'],
      rotas: ['4104808']
    })

    expect(payload.cidade_id).toBe(4104808)
    expect(typeof payload.cidade_id).toBe('number')
    expect(payload.participantes).toEqual([3, 7])
    expect(payload.rotas).toEqual([4104808])
  })

  it('envia descricao null quando só há espaços', () => {
    const payload = toCreateExpedicaoPayload({
      dataInicio,
      dataFim,
      destino: 1,
      descricao: '   ',
      participantes: [1]
    })

    expect(payload.descricao).toBeNull()
  })

  it('extrai a mensagem de erro devolvida pela API', () => {
    const error = { response: { data: { error: { message: 'A data_fim é obrigatória.' } } } }

    expect(extractApiErrorMessage(error)).toBe('A data_fim é obrigatória.')
    expect(extractApiErrorMessage(new Error('rede'))).toBeUndefined()
    expect(extractApiErrorMessage(undefined)).toBeUndefined()
  })
})
