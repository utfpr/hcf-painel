import {
  describe,
  expect,
  test
} from 'vitest'

import { fasesSucessionaisListParams } from '@/features/fases-sucessionais/search'

describe('fasesSucessionaisListParams', () => {
  test('omits order by default and trims the name filter', () => {
    expect(fasesSucessionaisListParams(' Fase inicial ', 1, 20)).toEqual({
      pagina: 1,
      limite: 20,
      nome: 'Fase inicial'
    })
  })

  test('omits blank name filters', () => {
    expect(fasesSucessionaisListParams('  ', 1, 20)).toEqual({
      pagina: 1,
      limite: 20
    })
  })

  test('maps supported table sorting to the API order parameter', () => {
    expect(fasesSucessionaisListParams('', 1, 20, { field: 'id', order: 'ascend' })).toEqual({
      pagina: 1,
      limite: 20,
      order: 'id:asc'
    })
    expect(fasesSucessionaisListParams('', 1, 20, { field: 'nome', order: 'descend' })).toEqual({
      pagina: 1,
      limite: 20,
      order: 'nome:desc'
    })
  })
})
