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

  it('monta o payload mantendo data/hora local com offset (sem converter para UTC)', () => {
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
      data_inicio: '2026-09-28T23:30:00-03:00',
      data_fim: '2026-10-02T18:00:00-03:00',
      cidade_id: 10,
      participantes: [3, 7],
      rotas: [
        10,
        4,
        10
      ]
    })
  })

  it('não envia created_by nem data_fim quando não preenchida, e rotas vira lista vazia', () => {
    const payload = toCreateExpedicaoPayload({
      dataInicio,
      dataFim: null,
      destino: 1,
      descricao: 'Teste',
      participantes: [1]
    })

    expect(payload).not.toHaveProperty('created_by')
    expect(payload.data_fim).toBeUndefined()
    expect(payload.rotas).toEqual([])
  })

  it('envia descricao null quando só há espaços', () => {
    const payload = toCreateExpedicaoPayload({
      dataInicio,
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
