import {
  describe,
  expect,
  test,
  vi
} from 'vitest'

import { fetchRelevos } from '@/features/relevos/useListaRelevosPage'
import type { HttpClient } from '@/libraries/http/HttpClient'

describe('fetchRelevos', () => {
  test('requests v2 with name and pagination params', async () => {
    const relevos = [{ id: 7, nome: 'Relevo montanhoso' }]
    const get = vi.fn().mockResolvedValue({ data: relevos })
    const httpClient = { get } as unknown as Pick<HttpClient, 'get'>

    await expect(fetchRelevos(httpClient, {
      pagina: 1,
      limite: 20,
      nome: 'montanhoso'
    })).resolves.toEqual({
      relevos,
      metadados: {
        total: 1,
        pagina: 1,
        limite: 20
      }
    })

    expect(get).toHaveBeenCalledWith('/v2/relevos', {
      pagina: 1,
      limite: 20,
      nome: 'montanhoso'
    })
  })

  test('supports an enveloped response with pagination metadata', async () => {
    const data = {
      relevos: [{ id: 7, nome: 'Relevo montanhoso' }],
      metadados: {
        total: 3, pagina: 1, limite: 20
      }
    }
    const get = vi.fn().mockResolvedValue({ data })
    const httpClient = { get } as unknown as Pick<HttpClient, 'get'>

    await expect(fetchRelevos(httpClient, {
      pagina: 1,
      limite: 20,
      nome: 'montanhoso'
    })).resolves.toEqual(data)
  })
})
