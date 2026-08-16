import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { vi } from 'vitest'

import { Broker } from '@/libraries/events/Broker'
import { HttpClient } from '@/libraries/http/HttpClient'

type AdapterResult = {
  data: unknown
  status: number
  statusText: string
  headers: Record<string, string>
  config: InternalAxiosRequestConfig
}

describe('HttpClient', () => {
  const originalAdapter = axios.defaults.adapter
  let lastConfig: InternalAxiosRequestConfig | undefined
  let nextStatus: number
  let nextData: unknown

  beforeEach(() => {
    lastConfig = undefined
    nextStatus = 200
    nextData = { ok: true }

    axios.defaults.adapter = async config => {
      lastConfig = config
      if (nextStatus >= 400) {
        const error = new AxiosError('Request failed')
        error.config = config
        error.response = {
          data: nextData,
          status: nextStatus,
          statusText: 'Error',
          headers: {},
          config
        }
        throw error
      }

      return {
        data: nextData,
        status: nextStatus,
        statusText: 'OK',
        headers: {},
        config
      } as AdapterResult
    }
  })

  afterEach(() => {
    axios.defaults.adapter = originalAdapter
  })

  function authorizationHeader(): string | undefined {
    const headers = lastConfig?.headers
    if (!headers) return undefined
    const value = headers.Authorization ?? headers.get?.('Authorization')
    return typeof value === 'string' ? value : undefined
  }

  it('sends Authorization Bearer when credentials return a token', async () => {
    const client = new HttpClient({
      baseUrl: 'https://api.example.com',
      broker: new Broker(),
      credentials: { getAccessToken: () => 'session-token' }
    })

    await client.get('/usuarios')

    expect(authorizationHeader()).toBe('Bearer session-token')
  })

  it('omits Authorization when credentials return undefined', async () => {
    const client = new HttpClient({
      baseUrl: 'https://api.example.com',
      broker: new Broker(),
      credentials: { getAccessToken: () => undefined }
    })

    await client.get('/usuarios')

    expect(authorizationHeader()).toBeUndefined()
  })

  it('omits Authorization when credentials are not provided', async () => {
    const client = new HttpClient({
      baseUrl: 'https://api.example.com',
      broker: new Broker()
    })

    await client.get('/usuarios')

    expect(authorizationHeader()).toBeUndefined()
  })

  it('emits http.unauthorized and rejects on 401', async () => {
    const broker = new Broker()
    const onUnauthorized = vi.fn()
    broker.subscribe('http.unauthorized', onUnauthorized)
    nextStatus = 401

    const client = new HttpClient({
      baseUrl: 'https://api.example.com',
      broker
    })

    await expect(client.get('/usuarios')).rejects.toBeInstanceOf(AxiosError)
    expect(onUnauthorized).toHaveBeenCalledTimes(1)
  })

  it('returns HttpClientResponse from delete', async () => {
    nextData = undefined
    nextStatus = 204
    const client = new HttpClient({
      baseUrl: 'https://api.example.com',
      broker: new Broker()
    })

    const response = await client.delete('/usuarios/1')

    expect(response.status).toBe(204)
    expect(response.data).toBeUndefined()
  })
})
