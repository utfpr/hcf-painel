import {
  describe,
  expect,
  test
} from 'vitest'

import {
  CATALOGOS_V1,
  catalogoV1Params,
  extraiIdCatalogoV1,
  normalizaCatalogoV1
} from '@/pages/tombos/catalogosV1'

describe('CATALOGOS_V1', () => {
  test('aponta para os endpoints v1 dos quatro catálogos do tombo', () => {
    expect(CATALOGOS_V1).toEqual({
      vegetacoes: '/v1/vegetacoes',
      relevos: '/v1/relevos',
      solos: '/v1/solos',
      fasesSucessionais: '/v1/fases-sucessionais'
    })
  })
})

describe('catalogoV1Params', () => {
  test('envia o nome da busca sem espaços nas bordas', () => {
    expect(catalogoV1Params(' Floresta ')).toEqual({ nome: 'Floresta' })
  })

  test('omite o parâmetro quando a busca é vazia, nula ou só espaços', () => {
    expect(catalogoV1Params('')).toEqual({})
    expect(catalogoV1Params('   ')).toEqual({})
    expect(catalogoV1Params(null)).toEqual({})
    expect(catalogoV1Params(undefined)).toEqual({})
  })
})

describe('normalizaCatalogoV1', () => {
  test('aceita resposta em array', () => {
    const solos = [{ id: 1, nome: 'Arenoso' }]

    expect(normalizaCatalogoV1(solos, 'solos')).toEqual(solos)
  })

  test('lê a lista do envelope pela chave informada', () => {
    const fases = [{ id: 4, nome: 'Capoeira' }]

    expect(normalizaCatalogoV1({ fasesSucessionais: fases, metadados: {} }, 'fasesSucessionais')).toEqual(fases)
  })

  test('usa resultado como fallback do envelope', () => {
    const relevos = [{ id: 2, nome: 'Plano' }]

    expect(normalizaCatalogoV1({ resultado: relevos }, 'relevos')).toEqual(relevos)
  })

  test('devolve lista vazia para resposta vazia ou inesperada', () => {
    expect(normalizaCatalogoV1(undefined, 'solos')).toEqual([])
    expect(normalizaCatalogoV1(null, 'solos')).toEqual([])
    expect(normalizaCatalogoV1('erro', 'solos')).toEqual([])
    expect(normalizaCatalogoV1({ outra: [] }, 'solos')).toEqual([])
  })
})

describe('extraiIdCatalogoV1', () => {
  test('converte id numérico ou textual para número', () => {
    expect(extraiIdCatalogoV1(7)).toBe(7)
    expect(extraiIdCatalogoV1('7')).toBe(7)
  })

  test('extrai o id de valor com label-in-value', () => {
    expect(extraiIdCatalogoV1({ key: '12', label: 'Campo' })).toBe(12)
  })

  test('devolve null quando não há id válido', () => {
    expect(extraiIdCatalogoV1(undefined)).toBeNull()
    expect(extraiIdCatalogoV1(null)).toBeNull()
    expect(extraiIdCatalogoV1('')).toBeNull()
    expect(extraiIdCatalogoV1('abc')).toBeNull()
    expect(extraiIdCatalogoV1(1.5)).toBeNull()
  })
})
