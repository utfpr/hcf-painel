import axios, { AxiosError, AxiosInstance } from 'axios'

import { Broker } from '../events/Broker'
import type { Credentials } from './Credentials'

export interface HttpHeaders extends Record<string, string | undefined> {
  'Content-Type': string
  'Content-Length': string
  Authorization?: string
}

export type HttpClientResponse<T> = {
  data: T
  status: number
  headers: HttpHeaders
}

export class HttpClient {
  private readonly broker: Broker

  private readonly credentials?: Credentials

  private readonly axios: AxiosInstance

  constructor(params: {
    baseUrl: string
    broker: Broker
    credentials?: Credentials
  }) {
    this.broker = params.broker
    this.credentials = params.credentials
    this.axios = axios.create({
      baseURL: params.baseUrl
    })

    this.axios.interceptors.request.use(config => {
      const token = this.credentials?.getAccessToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    this.axios.interceptors.response.use(
      response => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          this.broker.emit('http.unauthorized')
        }
        return Promise.reject(error)
      }
    )
  }

  async get<T>(
    url: string,
    params?: Record<string, string | number | boolean | undefined>
  ): Promise<HttpClientResponse<T>> {
    const response = await this.axios.get<T>(url, { params })
    return {
      data: response.data,
      status: response.status,
      headers: response.headers as HttpHeaders
    }
  }

  async post<T>(url: string, data: T): Promise<HttpClientResponse<T>> {
    const response = await this.axios.post<T>(url, data)
    return {
      data: response.data,
      status: response.status,
      headers: response.headers as HttpHeaders
    }
  }

  async put<T>(url: string, data: T): Promise<HttpClientResponse<T>> {
    const response = await this.axios.put<T>(url, data)
    return {
      data: response.data,
      status: response.status,
      headers: response.headers as HttpHeaders
    }
  }

  async delete<T>(url: string): Promise<HttpClientResponse<T>> {
    const response = await this.axios.delete<T>(url)
    return {
      data: response.data,
      status: response.status,
      headers: response.headers as HttpHeaders
    }
  }
}

export default null
