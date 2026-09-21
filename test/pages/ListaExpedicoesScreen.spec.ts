import moment from 'moment'
import {
  describe, expect, it
} from 'vitest'

import { expeditionFromApi, expeditionParams } from '../../src/pages/ListaExpedicoesScreen'

describe('listagem de expedições', () => {
  it('usa os filtros da API e ordena cada seção pela data de início', () => {
    const filters = {
      cidade_id: 42,
      usuario_id: 7,
      data_inicio_de: moment('2026-09-10'),
      data_fim_ate: moment('2026-10-10')
    }
    expect(expeditionParams('upcoming', filters, 2, 50, moment('2026-09-21'))).toEqual({
      pagina: 2,
      limite: 50,
      order_column: 'data_inicio',
      order_direction: 'asc',
      cidade_id: 42,
      usuario_id: 7,
      data_inicio_de: '2026-09-21',
      data_fim_ate: '2026-10-10'
    })
    expect(expeditionParams('past', filters, 1, 20, moment('2026-09-21'))).toEqual({
      pagina: 1,
      limite: 20,
      order_column: 'data_inicio',
      order_direction: 'desc',
      cidade_id: 42,
      usuario_id: 7,
      data_inicio_de: '2026-09-10',
      data_fim_ate: '2026-09-20'
    })
  })

  it('exibe os campos realmente devolvidos pela API', () => {
    const item = {
      id: 7,
      descricao: null,
      data_inicio: '2026-10-01',
      data_fim: '2026-10-03',
      cidade_id: 42,
      participantes: [
        3,
        5,
        8
      ]
    }
    expect(expeditionFromApi(item, new Map([[42, { nome: 'Belém' }]]))).toEqual({
      id: 7,
      description: null,
      startDate: '2026-10-01',
      endDate: '2026-10-03',
      destination: 'Belém',
      participantCount: 3
    })
  })
})
