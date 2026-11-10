import {
  describe,
  expect,
  test,
  vi
} from 'vitest'

import { fetchFasesSucessionais } from '@/features/fases-sucessionais/useListaFasesSucessionaisPage'
import type { HttpClient } from '@/libraries/http/HttpClient'

describe('fetchFasesSucessionais', () => {
  test('requests v2 with name and pagination params', async () => {
    const fasesSucessionais = [{ id: 7, nome: 'Fase inicial' }]
    const get = vi.fn().mockResolvedValue({ data: fasesSucessionais })
    const httpClient = { get } as unknown as Pick<HttpClient, 'get'>

    await expect(fetchFasesSucessionais(httpClient, {
      pagina: 1,
      limite: 20,
      nome: 'inicial'
    })).resolves.toEqual({
      fasesSucessionais,
      metadados: {
        total: 1,
        pagina: 1,
        limite: 20
      }
    })

    expect(get).toHaveBeenCalledWith('/v2/fases-sucessionais', {
      pagina: 1,
      limite: 20,
      nome: 'inicial'
    })
  })

  test('supports an enveloped response with pagination metadata', async () => {
    const data = {
      fasesSucessionais: [{ id: 7, nome: 'Fase inicial' }],
      metadados: {
        total: 3,
        pagina: 1,
        limite: 20
      }
    }
    const get = vi.fn().mockResolvedValue({ data })
    const httpClient = { get } as unknown as Pick<HttpClient, 'get'>

    await expect(fetchFasesSucessionais(httpClient, {
      pagina: 1,
      limite: 20,
      nome: 'inicial'
    })).resolves.toEqual(data)
  })
})
