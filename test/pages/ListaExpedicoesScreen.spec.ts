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
      order: 'data_inicio:desc',
      cidade_id: 42,
      usuario_id: 7,
      data_inicio_de: '2026-09-10',
      data_fim_ate: '2026-10-10'
    })
    expect(expeditionParams('past', filters, 1, 20, moment('2026-09-21'))).toEqual({
      pagina: 1,
      limite: 20,
      order: 'data_inicio:desc',
      cidade_id: 42,
      usuario_id: 7,
      data_inicio_de: '2026-09-10',
      data_fim_ate: '2026-09-20'
    })
  })

  it('não recorta próximas por data de início, para a expedição em curso continuar na lista', () => {
    expect(expeditionParams('upcoming', {}, 1, 20, moment('2026-09-28'))).toEqual({
      pagina: 1,
      limite: 20,
      order: 'data_inicio:desc'
    })
  })

  it('exibe os campos realmente devolvidos pela API', () => {
    const item = {
      id: 7,
      descricao: null,
      data_inicio: '2026-10-01',
      data_fim: '2026-10-03',
      cidade_id: 42,
      cidade_nome: 'Belém',
      estado_sigla: 'PA',
      // a API devolve os ids como string
      participantes: [
        { id: '3', nome: 'Ana' },
        { id: '5', nome: 'Bruno' },
        { id: '8', nome: 'Carla' }
      ],
      rotas: ['42']
    }
    expect(expeditionFromApi(item)).toEqual({
      id: 7,
      description: null,
      startDate: '2026-10-01',
      endDate: '2026-10-03',
      destination: 'Belém/PA',
      participantCount: 3
    })
  })

  it('cai no id da cidade quando a API não devolve o nome', () => {
    const item = {
      id: 9,
      descricao: null,
      data_inicio: '2026-10-01',
      data_fim: '2026-10-03',
      cidade_id: 42,
      cidade_nome: null,
      estado_sigla: null,
      participantes: [],
      rotas: []
    }
    expect(expeditionFromApi(item).destination).toBe('Cidade #42')
  })
})
