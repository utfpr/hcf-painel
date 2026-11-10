import {
  describe,
  expect,
  test
} from 'vitest'

import { solosListParams } from '@/features/solos/search'

describe('solosListParams', () => {
  test('omits order by default and trims the name filter', () => {
    expect(solosListParams(' Solo argiloso ', 1, 20)).toEqual({
      pagina: 1,
      limite: 20,
      nome: 'Solo argiloso'
    })
  })

  test('omits blank name filters', () => {
    expect(solosListParams('  ', 1, 20)).toEqual({
      pagina: 1,
      limite: 20
    })
  })

  test('maps supported table sorting to the API order parameter', () => {
    expect(solosListParams('', 1, 20, { field: 'id', order: 'ascend' })).toEqual({
      pagina: 1,
      limite: 20,
      order: 'id:asc'
    })
    expect(solosListParams('', 1, 20, { field: 'nome', order: 'descend' })).toEqual({
      pagina: 1,
      limite: 20,
      order: 'nome:desc'
    })
  })
})
