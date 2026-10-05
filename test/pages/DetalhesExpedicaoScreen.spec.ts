import {
  describe, expect, it
} from 'vitest'

import { locaisVisitadosDaParada } from '@/pages/DetalhesExpedicaoScreen'

describe('locais visitados na rota', () => {
  it('fica só com os locais marcados quando a cidade traz a lista inteira', () => {
    expect(locaisVisitadosDaParada({
      locais_coleta_ids: [122],
      locais_coleta: [
        { id: 10, descricao: 'Igarapé' },
        { id: 122, descricao: 'Praia' }
      ]
    })).toEqual({ nomes: ['Praia'], ids: [] })
  })

  it('usa os nomes que já vieram na parada', () => {
    expect(locaisVisitadosDaParada({
      locais_coleta: [{ id: 10, descricao: 'Igarapé' }]
    })).toEqual({ nomes: ['Igarapé'], ids: [] })
  })

  it('devolve os ids quando a parada não traz nome', () => {
    expect(locaisVisitadosDaParada({
      locais_coleta_ids: [10, 122]
    })).toEqual({ nomes: [], ids: [10, 122] })
  })

  it('não inventa local para cidade sem visita', () => {
    expect(locaisVisitadosDaParada({})).toEqual({ nomes: [], ids: [] })
  })
})
