import axios, { AxiosInstance } from 'axios'

import { Broker } from '../events/Broker'

export interface HttpHeaders extends Record<string, string | undefined> {
    'Content-Type': string
    'Content-Length': string
    'Authorization'?: string
}

export type HttpClientResponse<T> = {
    data: T
    status: number
    headers: HttpHeaders
}

export class HttpClient {
    private readonly broker: Broker

    private readonly axios: AxiosInstance

    constructor(params: { baseUrl: string; broker: Broker }) {
        this.broker = params.broker
        this.axios = axios.create({
            baseURL: params.baseUrl
        })

        this.axios.interceptors.response.use(response => {
            if (response.status === 401) {
                this.broker.emit('http.unauthorized')
            }
            return response
        })
    }

    async get<T>(url: string): Promise<HttpClientResponse<T>> {
        const response = await this.axios.get<T>(url)
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

    delete<T>(url: string): Promise<HttpClientResponse<T>> {
        return this.axios.delete(url)
    }
}

export default null
