import {
  describe,
  expect,
  test,
  vi
} from 'vitest'

import { fetchSolos } from '@/features/solos/useListaSolosPage'
import type { HttpClient } from '@/libraries/http/HttpClient'

describe('fetchSolos', () => {
  test('requests v2 with name and pagination params', async () => {
    const solos = [{ id: 7, nome: 'Solo argiloso' }]
    const get = vi.fn().mockResolvedValue({ data: solos })
    const httpClient = { get } as unknown as Pick<HttpClient, 'get'>

    await expect(fetchSolos(httpClient, {
      pagina: 1,
      limite: 20,
      nome: 'argiloso'
    })).resolves.toEqual({
      solos,
      metadados: {
        total: 1,
        pagina: 1,
        limite: 20
      }
    })

    expect(get).toHaveBeenCalledWith('/v2/solos', {
      pagina: 1,
      limite: 20,
      nome: 'argiloso'
    })
  })

  test('supports an enveloped response with pagination metadata', async () => {
    const data = {
      solos: [{ id: 7, nome: 'Solo argiloso' }],
      metadados: {
        total: 3,
        pagina: 1,
        limite: 20
      }
    }
    const get = vi.fn().mockResolvedValue({ data })
    const httpClient = { get } as unknown as Pick<HttpClient, 'get'>

    await expect(fetchSolos(httpClient, {
      pagina: 1,
      limite: 20,
      nome: 'argiloso'
    })).resolves.toEqual(data)
  })
})
