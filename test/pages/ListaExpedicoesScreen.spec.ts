import moment from 'moment'
import {
  describe, expect, it
} from 'vitest'

import {
  expeditionFromApi, expeditionParams, expeditionPeriod, expeditionStatus
} from '../../src/pages/ListaExpedicoesScreen'

describe('listagem de expedições', () => {
  it('usa os filtros da API e ordena próximas pelo início e realizadas pelo fim', () => {
    const filters = {
      cidade_id: 42,
      usuario_id: 7,
      data_inicio_de: moment('2026-09-10'),
      data_fim_ate: moment('2026-10-10')
    }
    expect(expeditionParams('upcoming', filters, 2, 50, moment('2026-09-21'))).toEqual({
      pagina: 2,
      limite: 50,
      order: 'data_inicio:asc',
      cidade_id: 42,
      usuario_id: 7,
      data_inicio_de: '2026-09-10',
      data_fim_de: '2026-09-21',
      data_fim_ate: '2026-10-10'
    })
    expect(expeditionParams('past', filters, 1, 20, moment('2026-09-21'))).toEqual({
      pagina: 1,
      limite: 20,
      order: 'data_fim:desc',
      cidade_id: 42,
      usuario_id: 7,
      data_inicio_de: '2026-09-10',
      data_fim_ate: '2026-09-20'
    })
  })

  it('próximas excluem só as já finalizadas, para a expedição em curso continuar na lista', () => {
    expect(expeditionParams('upcoming', {}, 1, 20, moment('2026-09-28'))).toEqual({
      pagina: 1,
      limite: 20,
      order: 'data_inicio:asc',
      data_fim_de: '2026-09-28'
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
      participants: [
        { id: '3', name: 'Ana' },
        { id: '5', name: 'Bruno' },
        { id: '8', name: 'Carla' }
      ]
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

  it('mostra o período em uma linha, com a duração em dias', () => {
    expect(expeditionPeriod('2026-10-14', '2026-10-18')).toBe('14–18 out 2026 · 5 dias')
    expect(expeditionPeriod('2026-10-29', '2026-11-01')).toBe('29 out – 1 nov 2026 · 4 dias')
    expect(expeditionPeriod('2026-12-28', '2027-01-02')).toBe('28 dez 2026 – 2 jan 2027 · 6 dias')
    expect(expeditionPeriod('2026-08-25', '2026-08-25')).toBe('25 ago 2026 · 1 dia')
  })

  it('descreve o status da expedição em relação a hoje', () => {
    const today = moment('2026-10-04')
    expect(expeditionStatus('2026-10-14', '2026-10-18', today)).toEqual({ label: 'Em 10 dias', color: 'blue' })
    expect(expeditionStatus('2026-10-05', '2026-10-06', today)).toEqual({ label: 'Amanhã', color: 'blue' })
    expect(expeditionStatus('2026-10-04', '2026-10-04', today)).toEqual({ label: 'Em andamento', color: 'green' })
    expect(expeditionStatus('2026-10-01', '2026-10-06', today)).toEqual({ label: 'Em andamento', color: 'green' })
    expect(expeditionStatus('2026-10-01', '2026-10-03', today)).toEqual({ label: 'Realizada ontem', color: 'default' })
    expect(expeditionStatus('2026-09-19', '2026-09-21', today)).toEqual({ label: 'Realizada há 13 dias', color: 'default' })
  })
})
