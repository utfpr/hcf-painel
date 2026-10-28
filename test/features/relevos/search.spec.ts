import {
  describe,
  expect,
  test
} from 'vitest'

import { relevosListParams } from '@/features/relevos/search'

describe('relevosListParams', () => {
  test('omits order by default and trims the name filter', () => {
    expect(relevosListParams(' Relevo montanhoso ', 1, 20)).toEqual({
      pagina: 1,
      limite: 20,
      nome: 'Relevo montanhoso'
    })
  })

  test('omits blank name filters', () => {
    expect(relevosListParams('  ', 1, 20)).toEqual({
      pagina: 1,
      limite: 20
    })
  })

  test('maps supported table sorting to the API order parameter', () => {
    expect(relevosListParams('', 1, 20, { field: 'id', order: 'ascend' })).toEqual({
      pagina: 1,
      limite: 20,
      order: 'id:asc'
    })
    expect(relevosListParams('', 1, 20, { field: 'nome', order: 'descend' })).toEqual({
      pagina: 1,
      limite: 20,
      order: 'nome:desc'
    })
  })
})
