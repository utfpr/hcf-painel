import {
  describe,
  expect,
  test
} from 'vitest'

import { vegetacoesListParams } from '@/features/vegetacoes/search'

describe('vegetacoesListParams', () => {
  test('omits order by default and trims the name filter', () => {
    expect(vegetacoesListParams(' Mata Atlântica ', 1, 20)).toEqual({
      pagina: 1,
      limite: 20,
      nome: 'Mata Atlântica'
    })
  })

  test('omits blank name filters', () => {
    expect(vegetacoesListParams('  ', 1, 20)).toEqual({
      pagina: 1,
      limite: 20
    })
  })

  test('maps supported table sorting to the API order parameter', () => {
    expect(vegetacoesListParams('', 1, 20, { field: 'id', order: 'ascend' })).toEqual({
      pagina: 1,
      limite: 20,
      order: 'id:asc'
    })
    expect(vegetacoesListParams('', 1, 20, { field: 'nome', order: 'descend' })).toEqual({
      pagina: 1,
      limite: 20,
      order: 'nome:desc'
    })
  })
})
