import {
  describe,
  expect,
  test,
  vi
} from 'vitest'

import { fetchVegetacoes } from '@/features/vegetacoes/useListaVegetacoesPage'
import type { HttpClient } from '@/libraries/http/HttpClient'

describe('fetchVegetacoes', () => {
  test('requests v2 and normalizes its array response', async () => {
    const vegetacoes = [{ id: 7, nome: 'Floresta Ombrófila' }]
    const get = vi.fn().mockResolvedValue({ data: vegetacoes })
    const httpClient = { get } as unknown as Pick<HttpClient, 'get'>

    await expect(fetchVegetacoes(httpClient, {
      pagina: 1,
      limite: 20,
      nome: 'Floresta'
    })).resolves.toEqual({
      vegetacoes,
      metadados: {
        total: 1,
        pagina: 1,
        limite: 20
      }
    })

    expect(get).toHaveBeenCalledWith('/v2/vegetacoes', {
      pagina: 1,
      limite: 20,
      nome: 'Floresta'
    })
  })

  test('supports an enveloped response with pagination metadata', async () => {
    const vegetacoes = [{ id: 7, nome: 'Floresta Ombrófila' }]
    const data = {
      vegetacoes,
      metadados: {
        total: 3,
        pagina: 1,
        limite: 20
      }
    }
    const get = vi.fn().mockResolvedValue({ data })
    const httpClient = { get } as unknown as Pick<HttpClient, 'get'>

    await expect(fetchVegetacoes(httpClient, {
      pagina: 1,
      limite: 20,
      nome: 'Floresta'
    })).resolves.toEqual(data)
  })
})
