import axios, { AxiosError } from 'axios'

import { getCookie, removeCookie } from './helpers/cookie'

axios.defaults.baseURL = import.meta.env.VITE_API_URL

axios.interceptors.request.use(
    request => {
        const token = getCookie<string>('Access_Token')
        if (token) {
            request.headers.Authorization = `Bearer ${token}`
        }
        return request
    },
    error => Promise.reject(error)
)

axios.interceptors.response.use(
    response => response,
    (error: AxiosError) => {
        const err: {error: {code: number}} = error.response?.data as {error: {code: number}}

        if (err.error.code === 401) {
            removeCookie('Access_Token')
            window.localStorage.removeItem('Logged_User')
            window.location.href = '/inicio'
        }
        return Promise.reject(error)
    }
)

window.global ||= window // See: https://stackoverflow.com/questions/72114775/vite-global-is-not-defined
